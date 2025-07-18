import * as React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
  useColorScheme,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  authenticate,
  useAuth,
  enrollPin,
  authenticateWithPin,
  getPinLockoutStatus,
  clearPinLockout,
  storeSecret,
  getSecret,
  getSignatureHeaders,
  getSignatureHeadersWithPublicKey,
  isSigningAvailable,
  PinAuthError,
  type PinLockoutStatus,
} from '@gmemmy/react-native-biolink';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FEATURES = [
  {
    id: 'biometric',
    title: '🔐 Biometric Authentication',
    description:
      'Test biometric authentication with and without device credential fallback',
  },
  {
    id: 'storage',
    title: '🗝️ Secure Storage',
    description:
      'Test secure storage and retrieval using device keychain/keystore',
  },
  {
    id: 'pin',
    title: '🔢 PIN Authentication',
    description: 'Test PIN enrollment, authentication, and lockout system',
  },
  {
    id: 'signing',
    title: '✍️ Request Signing',
    description: 'Test cryptographic signing for secure API requests',
  },
];

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const scrollViewRef = React.useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const index = Math.round(contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const scrollToIndex = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * SCREEN_WIDTH,
      animated: true,
    });
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: isDarkMode ? '#000' : '#fff' },
        ]}
        edges={['top', 'bottom']}
      >
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#000' }]}>
            Biolink Demo
          </Text>
          <Text
            style={[styles.subtitle, { color: isDarkMode ? '#999' : '#666' }]}
          >
            {FEATURES[currentIndex].title}
          </Text>
        </View>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.carousel}
        >
          <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <BiometricSection isDarkMode={isDarkMode} />
          </View>
          <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <SecureStorageSection isDarkMode={isDarkMode} />
          </View>
          <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <PinAuthSection isDarkMode={isDarkMode} />
          </View>
          <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <SigningSection isDarkMode={isDarkMode} />
          </View>
        </ScrollView>
        <View style={styles.indicatorContainer}>
          {FEATURES.map((feature, index) => (
            <TouchableOpacity
              key={feature.id}
              style={[
                styles.indicator,
                {
                  backgroundColor:
                    currentIndex === index
                      ? isDarkMode
                        ? '#fff'
                        : '#007AFF'
                      : isDarkMode
                        ? '#333'
                        : '#ccc',
                },
              ]}
              onPress={() => scrollToIndex(index)}
            />
          ))}
        </View>
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={[
              styles.navButton,
              { backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f9fa' },
              currentIndex === 0 && styles.navButtonDisabled,
            ]}
            onPress={() => scrollToIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
          >
            <Text
              style={[
                styles.navButtonText,
                { color: isDarkMode ? '#fff' : '#000' },
              ]}
            >
              ← Previous
            </Text>
          </TouchableOpacity>

          <View style={styles.navInfo}>
            <Text
              style={[
                styles.navInfoText,
                { color: isDarkMode ? '#999' : '#666' },
              ]}
            >
              {currentIndex + 1} of {FEATURES.length}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.navButton,
              { backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f9fa' },
              currentIndex === FEATURES.length - 1 && styles.navButtonDisabled,
            ]}
            onPress={() =>
              scrollToIndex(Math.min(FEATURES.length - 1, currentIndex + 1))
            }
            disabled={currentIndex === FEATURES.length - 1}
          >
            <Text
              style={[
                styles.navButtonText,
                { color: isDarkMode ? '#fff' : '#000' },
              ]}
            >
              Next →
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function BiometricSection({ isDarkMode }: { isDarkMode: boolean }) {
  const { isAuthenticated, error, isLoading, clearError } = useAuth();

  const handleBiometricsOnly = async () => {
    try {
      clearError();
      const result = await authenticate(false);
      if (result) {
        Alert.alert('Success', 'Biometric authentication successful!');
      }
    } catch (err) {
      console.error('Biometrics-only authentication failed:', err);
    }
  };

  const handleBiometricsWithFallback = async () => {
    try {
      clearError();
      const result = await authenticate(true);
      if (result) {
        Alert.alert('Success', 'Authentication successful!');
      }
    } catch (err) {
      console.error('Biometrics with fallback authentication failed:', err);
    }
  };

  return (
    <View style={styles.sectionContent}>
      <Text
        style={[
          styles.sectionDescription,
          { color: isDarkMode ? '#ccc' : '#666' },
        ]}
      >
        Test biometric authentication with and without device credential
        fallback
      </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.primaryButton,
            isLoading && styles.buttonDisabled,
          ]}
          onPress={handleBiometricsOnly}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Authenticating...' : 'Biometrics Only'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            styles.secondaryButton,
            isLoading && styles.buttonDisabled,
          ]}
          onPress={handleBiometricsWithFallback}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Authenticating...' : 'Biometrics + Device PIN'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.statusContainer}>
        {isAuthenticated && (
          <Text style={styles.successText}>✅ Authenticated Successfully</Text>
        )}
        {error && <Text style={styles.errorText}>❌ {error}</Text>}
      </View>
    </View>
  );
}

function SecureStorageSection({ isDarkMode }: { isDarkMode: boolean }) {
  const [storeKey, setStoreKey] = React.useState('');
  const [storeValue, setStoreValue] = React.useState('');
  const [retrieveKey, setRetrieveKey] = React.useState('');
  const [retrievedValue, setRetrievedValue] = React.useState<string | null>(
    null,
  );
  const [message, setMessage] = React.useState('');

  const handleStoreSecret = async () => {
    if (!storeKey.trim() || !storeValue.trim()) {
      setMessage('❌ Please enter both key and value');
      return;
    }

    try {
      await storeSecret(storeKey.trim(), storeValue.trim());
      setMessage(`✅ Stored secret for key: ${storeKey}`);
      setStoreKey('');
      setStoreValue('');
    } catch (error) {
      setMessage(
        `❌ Failed to store: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  };

  const handleRetrieveSecret = async () => {
    if (!retrieveKey.trim()) {
      setMessage('❌ Please enter a key to retrieve');
      return;
    }

    try {
      const secret = await getSecret(retrieveKey.trim());
      if (secret) {
        setRetrievedValue(secret);
        setMessage(`✅ Retrieved secret for key: ${retrieveKey}`);
      } else {
        setRetrievedValue(null);
        setMessage(`❌ No secret found for key: ${retrieveKey}`);
      }
    } catch (error) {
      setMessage(
        `❌ Failed to retrieve: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  };

  return (
    <View style={styles.sectionContent}>
      <Text
        style={[
          styles.sectionDescription,
          { color: isDarkMode ? '#ccc' : '#666' },
        ]}
      >
        Test secure storage and retrieval using device keychain/keystore
      </Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollContent}
      >
        <View style={styles.inputGroup}>
          <Text
            style={[styles.inputLabel, { color: isDarkMode ? '#fff' : '#000' }]}
          >
            Store Secret:
          </Text>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: isDarkMode ? '#333' : '#fff',
                color: isDarkMode ? '#fff' : '#000',
                borderColor: isDarkMode ? '#555' : '#ddd',
              },
            ]}
            placeholder="Enter key"
            placeholderTextColor={isDarkMode ? '#999' : '#666'}
            value={storeKey}
            onChangeText={setStoreKey}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: isDarkMode ? '#333' : '#fff',
                color: isDarkMode ? '#fff' : '#000',
                borderColor: isDarkMode ? '#555' : '#ddd',
              },
            ]}
            placeholder="Enter value to store"
            placeholderTextColor={isDarkMode ? '#999' : '#666'}
            value={storeValue}
            onChangeText={setStoreValue}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={[styles.button, styles.tertiaryButton]}
            onPress={handleStoreSecret}
          >
            <Text style={styles.buttonText}>Store Secret</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text
            style={[styles.inputLabel, { color: isDarkMode ? '#fff' : '#000' }]}
          >
            Retrieve Secret:
          </Text>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: isDarkMode ? '#333' : '#fff',
                color: isDarkMode ? '#fff' : '#000',
                borderColor: isDarkMode ? '#555' : '#ddd',
              },
            ]}
            placeholder="Enter key to retrieve"
            placeholderTextColor={isDarkMode ? '#999' : '#666'}
            value={retrieveKey}
            onChangeText={setRetrieveKey}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={[styles.button, styles.tertiaryButton]}
            onPress={handleRetrieveSecret}
          >
            <Text style={styles.buttonText}>Retrieve Secret</Text>
          </TouchableOpacity>

          {retrievedValue && (
            <View
              style={[
                styles.resultContainer,
                { backgroundColor: isDarkMode ? '#2a2a2a' : '#e8f5e8' },
              ]}
            >
              <Text
                style={[
                  styles.resultLabel,
                  { color: isDarkMode ? '#ccc' : '#666' },
                ]}
              >
                Retrieved Value:
              </Text>
              <Text
                style={[
                  styles.resultValue,
                  { color: isDarkMode ? '#fff' : '#000' },
                ]}
              >
                {retrievedValue}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {message && (
        <View style={styles.statusContainer}>
          <Text
            style={[styles.statusText, { color: isDarkMode ? '#fff' : '#000' }]}
          >
            {message}
          </Text>
        </View>
      )}
    </View>
  );
}

function PinAuthSection({ isDarkMode }: { isDarkMode: boolean }) {
  const [pinInput, setPinInput] = React.useState('');
  const [pinMessage, setPinMessage] = React.useState('');
  const [pinLockoutStatus, setPinLockoutStatus] =
    React.useState<PinLockoutStatus>({
      isLocked: false,
      remainingAttempts: 5,
      totalAttempts: 0,
    });
  const [isPinEnrolled, setIsPinEnrolled] = React.useState(false);

  React.useEffect(() => {
    const checkPinStatus = async () => {
      try {
        const status = await getPinLockoutStatus();
        setPinLockoutStatus(status);
        setIsPinEnrolled(status.totalAttempts > 0 || status.isLocked);
      } catch (error) {
        console.error('Failed to check PIN status:', error);
      }
    };

    checkPinStatus();
  }, []);

  const handleEnrollPin = async () => {
    if (!pinInput || pinInput.length < 4) {
      setPinMessage('❌ PIN must be at least 4 digits');
      return;
    }

    try {
      await enrollPin(pinInput);
      setPinMessage('✅ PIN enrolled successfully');
      setIsPinEnrolled(true);
      setPinInput('');

      const status = await getPinLockoutStatus();
      setPinLockoutStatus(status);
    } catch (error) {
      if (error instanceof PinAuthError) {
        setPinMessage(`❌ ${error.message}`);
      } else {
        setPinMessage(
          `❌ Failed to enroll PIN: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }
  };

  const handleAuthenticateWithPin = async () => {
    if (!pinInput) {
      setPinMessage('❌ Please enter your PIN');
      return;
    }

    try {
      await authenticateWithPin(pinInput);
      setPinMessage('✅ PIN authentication successful');
      setPinInput('');

      const status = await getPinLockoutStatus();
      setPinLockoutStatus(status);
    } catch (error) {
      if (error instanceof PinAuthError) {
        setPinMessage(`❌ ${error.message}`);

        const status = await getPinLockoutStatus();
        setPinLockoutStatus(status);
      } else {
        setPinMessage(
          `❌ Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }
  };

  const handleClearPinLockout = async () => {
    try {
      await clearPinLockout();
      setPinMessage('✅ PIN lockout cleared');

      const status = await getPinLockoutStatus();
      setPinLockoutStatus(status);
    } catch (error) {
      setPinMessage(
        `❌ Failed to clear lockout: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  };

  return (
    <View style={styles.sectionContent}>
      <Text
        style={[
          styles.sectionDescription,
          { color: isDarkMode ? '#ccc' : '#666' },
        ]}
      >
        Test PIN enrollment, authentication, and lockout system
      </Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollContent}
      >
        <View style={styles.statusRow}>
          <Text
            style={[
              styles.statusLabel,
              { color: isDarkMode ? '#ccc' : '#666' },
            ]}
          >
            Status: {isPinEnrolled ? '✅ PIN Enrolled' : '❌ No PIN Enrolled'}
          </Text>
        </View>

        {pinLockoutStatus.isLocked && (
          <View style={styles.statusRow}>
            <Text style={styles.lockoutText}>
              🔒 PIN Locked{' '}
              {pinLockoutStatus.lockoutEndsAt
                ? `until ${pinLockoutStatus.lockoutEndsAt.toLocaleTimeString()}`
                : ''}
            </Text>
          </View>
        )}

        {!pinLockoutStatus.isLocked &&
          pinLockoutStatus.remainingAttempts < 5 && (
            <View style={styles.statusRow}>
              <Text style={styles.attemptsText}>
                ⚠️ {pinLockoutStatus.remainingAttempts} attempts remaining
              </Text>
            </View>
          )}

        <View style={styles.inputGroup}>
          <Text
            style={[styles.inputLabel, { color: isDarkMode ? '#fff' : '#000' }]}
          >
            Enter PIN:
          </Text>
          <TextInput
            style={[
              styles.textInput,
              styles.pinTextInput,
              {
                backgroundColor: isDarkMode ? '#333' : '#fff',
                color: isDarkMode ? '#fff' : '#000',
                borderColor: isDarkMode ? '#555' : '#ddd',
              },
            ]}
            placeholder="Enter 4-8 digit PIN"
            placeholderTextColor={isDarkMode ? '#999' : '#666'}
            value={pinInput}
            onChangeText={setPinInput}
            keyboardType="numeric"
            secureTextEntry
            maxLength={8}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.buttonContainer}>
          {!isPinEnrolled && (
            <TouchableOpacity
              style={[styles.button, styles.successButton]}
              onPress={handleEnrollPin}
            >
              <Text style={styles.buttonText}>Enroll PIN</Text>
            </TouchableOpacity>
          )}

          {isPinEnrolled && !pinLockoutStatus.isLocked && (
            <TouchableOpacity
              style={[styles.button, styles.successButton]}
              onPress={handleAuthenticateWithPin}
            >
              <Text style={styles.buttonText}>Authenticate</Text>
            </TouchableOpacity>
          )}

          {pinLockoutStatus.isLocked && (
            <TouchableOpacity
              style={[styles.button, styles.dangerButton]}
              onPress={handleClearPinLockout}
            >
              <Text style={styles.buttonText}>Clear Lockout</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {pinMessage && (
        <View style={styles.statusContainer}>
          <Text
            style={[styles.statusText, { color: isDarkMode ? '#fff' : '#000' }]}
          >
            {pinMessage}
          </Text>
        </View>
      )}
    </View>
  );
}

function SigningSection({ isDarkMode }: { isDarkMode: boolean }) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [signatureResult, setSignatureResult] = React.useState<string>('');
  const [publicKeyResult, setPublicKeyResult] = React.useState<string>('');
  const [fetchResult, setFetchResult] = React.useState<string>('');

  const handleTestSigning = async () => {
    setIsLoading(true);
    setSignatureResult('');
    setPublicKeyResult('');
    setFetchResult('');

    try {
      const payload = {
        userId: 123,
        action: 'login',
        timestamp: Date.now(),
      };

      const signatureHeaders = await getSignatureHeaders(payload);
      setSignatureResult(
        `Signature: ${signatureHeaders['X-Body-Signature'].substring(0, 50)}...`,
      );

      const fullHeaders = await getSignatureHeadersWithPublicKey(payload);
      setPublicKeyResult(
        `Public Key: ${fullHeaders['X-Public-Key'].substring(0, 50)}...`,
      );

      const mockResponse = await mockFetchWithHeaders(payload, fullHeaders);
      setFetchResult(`Mock API Response: ${mockResponse}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      setSignatureResult(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckAvailability = async () => {
    try {
      const available = await isSigningAvailable();
      Alert.alert(
        'Signing Availability',
        available
          ? 'Signing capabilities are available'
          : 'Signing capabilities are not available',
      );
    } catch {
      Alert.alert('Error', 'Failed to check signing availability');
    }
  };

  const mockFetchWithHeaders = async (
    payload: object,
    headers: Record<string, string>,
  ) => {
    // Simulate network delay
    await new Promise<void>(resolve => {
      setTimeout(() => resolve(), 500);
    });

    return `Success! Headers sent: ${Object.keys(headers).join(', ')}`;
  };

  return (
    <View style={styles.sectionContent}>
      <Text
        style={[
          styles.sectionDescription,
          { color: isDarkMode ? '#fff' : '#000' },
        ]}
      >
        Test cryptographic signing for secure API requests. This demonstrates
        how to sign request bodies and include signatures in HTTP headers.
      </Text>

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.primaryButton,
              isLoading && styles.buttonDisabled,
            ]}
            onPress={handleTestSigning}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Signing...' : 'Test Request Signing'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleCheckAvailability}
          >
            <Text style={styles.buttonText}>Check Signing Availability</Text>
          </TouchableOpacity>
        </View>

        {signatureResult && (
          <View
            style={[
              styles.resultContainer,
              { backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f9fa' },
            ]}
          >
            <Text
              style={[
                styles.resultLabel,
                { color: isDarkMode ? '#fff' : '#000' },
              ]}
            >
              Signature Result:
            </Text>
            <Text
              style={[
                styles.resultValue,
                { color: isDarkMode ? '#fff' : '#000' },
              ]}
            >
              {signatureResult}
            </Text>
          </View>
        )}

        {publicKeyResult && (
          <View
            style={[
              styles.resultContainer,
              { backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f9fa' },
            ]}
          >
            <Text
              style={[
                styles.resultLabel,
                { color: isDarkMode ? '#fff' : '#000' },
              ]}
            >
              Public Key Result:
            </Text>
            <Text
              style={[
                styles.resultValue,
                { color: isDarkMode ? '#fff' : '#000' },
              ]}
            >
              {publicKeyResult}
            </Text>
          </View>
        )}

        {fetchResult && (
          <View
            style={[
              styles.resultContainer,
              { backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f9fa' },
            ]}
          >
            <Text
              style={[
                styles.resultLabel,
                { color: isDarkMode ? '#fff' : '#000' },
              ]}
            >
              Mock API Call:
            </Text>
            <Text
              style={[
                styles.resultValue,
                { color: isDarkMode ? '#fff' : '#000' },
              ]}
            >
              {fetchResult}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  carousel: {
    flex: 1,
  },
  slide: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionContent: {
    flex: 1,
    paddingTop: 20,
  },
  sectionDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 30,
    textAlign: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  pinTextInput: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  buttonContainer: {
    gap: 12,
    marginVertical: 20,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  tertiaryButton: {
    backgroundColor: '#FF9500',
  },
  successButton: {
    backgroundColor: '#34C759',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  statusRow: {
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  statusText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  successText: {
    fontSize: 18,
    color: '#34C759',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    lineHeight: 24,
  },
  lockoutText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '500',
  },
  attemptsText: {
    fontSize: 16,
    color: '#FF9500',
    fontWeight: '500',
  },
  resultContainer: {
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  navInfo: {
    alignItems: 'center',
  },
  navInfoText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default App;
