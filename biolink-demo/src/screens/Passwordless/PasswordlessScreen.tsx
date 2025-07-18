import * as React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
  Dimensions,
  useColorScheme,
} from 'react-native';
import type {
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import {
  authenticate,
  enrollPin,
  authenticateWithPin,
  getSignatureHeadersWithPublicKey,
} from '@gmemmy/react-native-biolink';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type AuthMode = 'register' | 'login' | 'pin-enroll';

export default function PasswordlessScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const [authMode, setAuthMode] = React.useState<AuthMode>('login');
  const [isLoading, setIsLoading] = React.useState(false);
  const [pin, setPin] = React.useState(['', '', '', '']);
  const [pinInputs, _setPinInputs] = React.useState<TextInput[]>([]);
  const [showPinModal, setShowPinModal] = React.useState(false);
  const [publicKey, setPublicKey] = React.useState('');
  const [signature, setSignature] = React.useState('');
  const [retryCount, setRetryCount] = React.useState(0);
  const [showSuccess, setShowSuccess] = React.useState(false);

  const handlePinChange = (text: string, index: number) => {
    const newPin = [...pin];
    newPin[index] = text;
    setPin(newPin);

    if (text && index < 3) {
      pinInputs[index + 1]?.focus();
    }
  };

  const handlePinKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !pin[index] && index > 0) {
      pinInputs[index - 1]?.focus();
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);

    try {
      const challenge = {
        timestamp: Date.now(),
        nonce: Math.random().toString(36).substring(7),
        action: 'register',
      };

      const headers = await getSignatureHeadersWithPublicKey(
        JSON.stringify(challenge)
      );
      setPublicKey(headers['X-Public-Key'] || '');
      setSignature(headers['X-Body-Signature'] || '');

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      Alert.alert(
        'Registration Successful',
        'Your passkey has been created and registered successfully!',
        [{ text: 'OK', onPress: () => setAuthMode('login') }]
      );
    } catch {
      Alert.alert(
        'Registration Failed',
        'Registration failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setIsLoading(true);

    try {
      await authenticate(true);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      Alert.alert('Success', 'Biometric authentication successful!');
    } catch (error) {
      Alert.alert(
        'Authentication Failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinLogin = () => {
    setShowPinModal(true);
  };

  const handlePinSubmit = async () => {
    const pinString = pin.join('');
    if (pinString.length !== 4) {
      Alert.alert('Invalid PIN', 'Please enter a 4-digit PIN');
      return;
    }

    setIsLoading(true);

    try {
      await authenticateWithPin(pinString);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      setShowPinModal(false);
      setPin(['', '', '', '']);
      setRetryCount(0);
      Alert.alert('Success', 'PIN authentication successful!');
    } catch {
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);
      setPin(['', '', '', '']);
      pinInputs[0]?.focus();

      if (newRetryCount >= 3) {
        Alert.alert(
          'Too Many Attempts',
          'Too many failed attempts. Please try again later.'
        );
        setShowPinModal(false);
        setRetryCount(0);
      } else {
        Alert.alert(
          'Invalid PIN',
          `Invalid PIN. ${3 - newRetryCount} attempts remaining.`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinEnroll = async () => {
    const pinString = pin.join('');
    if (pinString.length !== 4) {
      Alert.alert('Invalid PIN', 'Please enter a 4-digit PIN');
      return;
    }

    setIsLoading(true);

    try {
      await enrollPin(pinString);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      setShowPinModal(false);
      setPin(['', '', '', '']);
      setAuthMode('login');
      Alert.alert('Success', 'PIN enrolled successfully!');
    } catch {
      Alert.alert(
        'PIN Enrollment Failed',
        'Failed to enroll PIN. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (_text: string) => {
    Alert.alert('Copied', 'Text copied to clipboard');
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#000' : '#fff' },
      ]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#000' }]}>
          Passwordless Authentication
        </Text>
        <Text
          style={[styles.subtitle, { color: isDarkMode ? '#999' : '#666' }]}
        >
          Secure biometric and PIN-based authentication
        </Text>
      </View>

      <View style={styles.modeContainer}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            authMode === 'login' && styles.activeModeButton,
            { backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' },
          ]}
          onPress={() => setAuthMode('login')}
        >
          <Text
            style={[
              styles.modeText,
              authMode === 'login' && styles.activeModeText,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            Login
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.modeButton,
            authMode === 'register' && styles.activeModeButton,
            { backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' },
          ]}
          onPress={() => setAuthMode('register')}
        >
          <Text
            style={[
              styles.modeText,
              authMode === 'register' && styles.activeModeText,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            Register
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.modeButton,
            authMode === 'pin-enroll' && styles.activeModeButton,
            { backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' },
          ]}
          onPress={() => setAuthMode('pin-enroll')}
        >
          <Text
            style={[
              styles.modeText,
              authMode === 'pin-enroll' && styles.activeModeText,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            Enroll PIN
          </Text>
        </TouchableOpacity>
      </View>

      {authMode === 'login' && (
        <View style={styles.authContainer}>
          <View style={styles.iconContainer}>
            <Text style={styles.lockIcon}>🔐</Text>
            {showSuccess && <Text style={styles.successIcon}>✅</Text>}
          </View>

          <TouchableOpacity
            style={[
              styles.authButton,
              { backgroundColor: isDarkMode ? '#007AFF' : '#007AFF' },
            ]}
            onPress={handleBiometricLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.authButtonText}>
                Authenticate with Biometrics
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.authButton,
              styles.secondaryButton,
              { backgroundColor: isDarkMode ? '#333' : '#f0f0f0' },
            ]}
            onPress={handlePinLogin}
            disabled={isLoading}
          >
            <Text
              style={[
                styles.authButtonText,
                { color: isDarkMode ? '#fff' : '#000' },
              ]}
            >
              Use PIN Instead
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {authMode === 'register' && (
        <View style={styles.authContainer}>
          <View style={styles.iconContainer}>
            <Text style={styles.lockIcon}>🔐</Text>
            {showSuccess && <Text style={styles.successIcon}>✅</Text>}
          </View>

          <TouchableOpacity
            style={[
              styles.authButton,
              { backgroundColor: isDarkMode ? '#007AFF' : '#007AFF' },
            ]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.authButtonText}>Register Passkey</Text>
            )}
          </TouchableOpacity>

          {publicKey && (
            <View style={styles.resultContainer}>
              <Text
                style={[
                  styles.resultTitle,
                  { color: isDarkMode ? '#fff' : '#000' },
                ]}
              >
                Registration Result:
              </Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => copyToClipboard(publicKey)}
              >
                <Text style={styles.copyButtonText}>Copy Public Key</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => copyToClipboard(signature)}
              >
                <Text style={styles.copyButtonText}>Copy Signature</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {authMode === 'pin-enroll' && (
        <View style={styles.authContainer}>
          <View style={styles.iconContainer}>
            <Text style={styles.lockIcon}>🔐</Text>
            {showSuccess && <Text style={styles.successIcon}>✅</Text>}
          </View>

          <TouchableOpacity
            style={[
              styles.authButton,
              { backgroundColor: isDarkMode ? '#007AFF' : '#007AFF' },
            ]}
            onPress={() => setShowPinModal(true)}
            disabled={isLoading}
          >
            <Text style={styles.authButtonText}>Enroll PIN</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={showPinModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: isDarkMode ? '#1a1a1a' : '#fff' },
            ]}
          >
            <Text
              style={[
                styles.modalTitle,
                { color: isDarkMode ? '#fff' : '#000' },
              ]}
            >
              {authMode === 'pin-enroll' ? 'Enroll PIN' : 'Enter PIN'}
            </Text>

            <View style={styles.pinContainer}>
              {[0, 1, 2, 3].map(index => (
                <TextInput
                  key={`pin-input-${index}`}
                  ref={ref => {
                    if (ref) pinInputs[index] = ref;
                  }}
                  style={[
                    styles.pinInput,
                    {
                      backgroundColor: isDarkMode ? '#333' : '#f5f5f5',
                      color: isDarkMode ? '#fff' : '#000',
                      borderColor: isDarkMode ? '#555' : '#ddd',
                    },
                  ]}
                  value={pin[index]}
                  onChangeText={text => handlePinChange(text, index)}
                  onKeyPress={e => handlePinKeyPress(e, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  secureTextEntry
                />
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.cancelButton,
                  { backgroundColor: isDarkMode ? '#333' : '#f0f0f0' },
                ]}
                onPress={() => {
                  setShowPinModal(false);
                  setPin(['', '', '', '']);
                }}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    { color: isDarkMode ? '#fff' : '#000' },
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.submitButton,
                  { backgroundColor: isDarkMode ? '#007AFF' : '#007AFF' },
                ]}
                onPress={
                  authMode === 'pin-enroll' ? handlePinEnroll : handlePinSubmit
                }
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalButtonText}>
                    {authMode === 'pin-enroll' ? 'Enroll' : 'Submit'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {retryCount > 0 && (
              <Text
                style={[
                  styles.retryText,
                  { color: isDarkMode ? '#ff6b6b' : '#ff4444' },
                ]}
              >
                {3 - retryCount} attempts remaining
              </Text>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  modeContainer: {
    flexDirection: 'row',
    marginBottom: 40,
    borderRadius: 12,
    padding: 4,
    backgroundColor: '#f0f0f0',
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeModeButton: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeModeText: {
    color: '#007AFF',
  },
  authContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 30,
  },
  lockIcon: {
    fontSize: 80,
  },
  successIcon: {
    position: 'absolute',
    top: -10,
    right: -10,
    fontSize: 30,
  },
  authButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButton: {
    marginTop: 8,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    width: '100%',
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  copyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  copyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: SCREEN_WIDTH * 0.8,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  pinInput: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    marginRight: 4,
  },
  submitButton: {
    marginLeft: 4,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  retryText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
    fontWeight: '500',
  },
});
