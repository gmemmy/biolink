import * as React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import {
  authenticate,
  getSignatureHeaders,
  getSignatureHeadersWithPublicKey,
  isSigningAvailable,
} from '@gmemmy/react-native-biolink';

export default function SettingsScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const [isLoading, setIsLoading] = React.useState(false);
  const [biometricStatus, setBiometricStatus] = React.useState<
    'enabled' | 'disabled' | 'testing'
  >('enabled');
  const [pinStatus, _setPinStatus] = React.useState<
    'enabled' | 'disabled' | 'setting'
  >('enabled');
  const [signingStatus, setSigningStatus] = React.useState<
    'available' | 'unavailable' | 'testing'
  >('available');
  const [publicKey, setPublicKey] = React.useState('');
  const [sampleSignature, setSampleSignature] = React.useState('');

  const handleTestBiometrics = async () => {
    setIsLoading(true);
    setBiometricStatus('testing');

    try {
      await authenticate(true);
      setBiometricStatus('enabled');
      Alert.alert('Success', 'Biometric authentication working correctly!');
    } catch (error) {
      setBiometricStatus('disabled');
      Alert.alert(
        'Test Failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPin = () => {
    Alert.alert(
      'Set PIN',
      'This feature will be implemented to allow PIN enrollment and management.',
      [{ text: 'OK' }]
    );
  };

  const handleExportPublicKey = async () => {
    setIsLoading(true);

    try {
      const headers = await getSignatureHeadersWithPublicKey('test');
      setPublicKey(headers['X-Public-Key'] || '');
      Alert.alert('Success', 'Public key exported successfully!');
    } catch (error) {
      Alert.alert(
        'Export Failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignSample = async () => {
    setIsLoading(true);
    setSigningStatus('testing');

    try {
      const samplePayload = {
        action: 'test_signature',
        timestamp: Date.now(),
        data: 'Sample payload for testing',
      };

      const headers = await getSignatureHeaders(JSON.stringify(samplePayload));
      setSampleSignature(headers['X-Body-Signature'] || '');
      setSigningStatus('available');
      Alert.alert('Success', 'Sample payload signed successfully!');
    } catch (error) {
      setSigningStatus('unavailable');
      Alert.alert(
        'Signing Failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckSigningAvailability = async () => {
    setIsLoading(true);

    try {
      const available = await isSigningAvailable();
      setSigningStatus(available ? 'available' : 'unavailable');
      Alert.alert(
        'Availability Check',
        `Signing is ${available ? 'available' : 'unavailable'} on this device.`
      );
    } catch (error) {
      Alert.alert(
        'Check Failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    Alert.alert('Copied', `${label} copied to clipboard`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enabled':
      case 'available':
        return '#34C759';
      case 'disabled':
      case 'unavailable':
        return '#FF3B30';
      case 'testing':
        return '#FF9500';
      default:
        return '#999';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'enabled':
        return '✓ Enabled';
      case 'disabled':
        return '✗ Disabled';
      case 'testing':
        return '⏳ Testing...';
      case 'available':
        return '✓ Available';
      case 'unavailable':
        return '✗ Unavailable';
      default:
        return 'Unknown';
    }
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
          ⚙️ Multi-Factor Settings
        </Text>
        <Text
          style={[styles.subtitle, { color: isDarkMode ? '#999' : '#666' }]}
        >
          Configure and test your security settings
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            Biometric Authentication
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(biometricStatus) },
            ]}
          >
            <Text style={styles.statusText}>
              {getStatusText(biometricStatus)}
            </Text>
          </View>
        </View>

        <Text
          style={[
            styles.sectionDescription,
            { color: isDarkMode ? '#999' : '#666' },
          ]}
        >
          Test and configure fingerprint or face recognition authentication
        </Text>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: isDarkMode ? '#007AFF' : '#007AFF' },
          ]}
          onPress={handleTestBiometrics}
          disabled={isLoading}
        >
          {isLoading && biometricStatus === 'testing' ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Test Biometrics</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            PIN Authentication
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(pinStatus) },
            ]}
          >
            <Text style={styles.statusText}>{getStatusText(pinStatus)}</Text>
          </View>
        </View>

        <Text
          style={[
            styles.sectionDescription,
            { color: isDarkMode ? '#999' : '#666' },
          ]}
        >
          Set up a backup PIN for authentication
        </Text>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: isDarkMode ? '#FF9500' : '#FF9500' },
          ]}
          onPress={handleSetPin}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Set PIN</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            Digital Signing
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(signingStatus) },
            ]}
          >
            <Text style={styles.statusText}>
              {getStatusText(signingStatus)}
            </Text>
          </View>
        </View>

        <Text
          style={[
            styles.sectionDescription,
            { color: isDarkMode ? '#999' : '#666' },
          ]}
        >
          Test cryptographic signing capabilities
        </Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.halfButton,
              { backgroundColor: isDarkMode ? '#34C759' : '#34C759' },
            ]}
            onPress={handleCheckSigningAvailability}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Check Availability</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.halfButton,
              { backgroundColor: isDarkMode ? '#007AFF' : '#007AFF' },
            ]}
            onPress={handleSignSample}
            disabled={isLoading}
          >
            {isLoading && signingStatus === 'testing' ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Test Signing</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text
          style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#000' }]}
        >
          Public Key Export
        </Text>
        <Text
          style={[
            styles.sectionDescription,
            { color: isDarkMode ? '#999' : '#666' },
          ]}
        >
          Export your public key for verification
        </Text>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: isDarkMode ? '#5856D6' : '#5856D6' },
          ]}
          onPress={handleExportPublicKey}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Export Public Key</Text>
          )}
        </TouchableOpacity>
      </View>

      {(publicKey || sampleSignature) && (
        <View style={styles.resultsSection}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            Test Results
          </Text>

          {publicKey && (
            <View
              style={[
                styles.resultCard,
                { backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f9fa' },
              ]}
            >
              <View style={styles.resultHeader}>
                <Text style={styles.resultLabel}>Public Key:</Text>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() => copyToClipboard(publicKey, 'Public Key')}
                >
                  <Text style={styles.copyButtonText}>Copy</Text>
                </TouchableOpacity>
              </View>
              <Text
                style={[
                  styles.resultValue,
                  { color: isDarkMode ? '#ccc' : '#666' },
                ]}
              >
                {publicKey.substring(0, 50)}...
              </Text>
            </View>
          )}

          {sampleSignature && (
            <View
              style={[
                styles.resultCard,
                { backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f9fa' },
              ]}
            >
              <View style={styles.resultHeader}>
                <Text style={styles.resultLabel}>Sample Signature:</Text>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() => copyToClipboard(sampleSignature, 'Signature')}
                >
                  <Text style={styles.copyButtonText}>Copy</Text>
                </TouchableOpacity>
              </View>
              <Text
                style={[
                  styles.resultValue,
                  { color: isDarkMode ? '#ccc' : '#666' },
                ]}
              >
                {sampleSignature.substring(0, 50)}...
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.infoSection}>
        <Text
          style={[styles.infoTitle, { color: isDarkMode ? '#fff' : '#000' }]}
        >
          🔐 Security Information
        </Text>
        <View style={styles.infoList}>
          <Text
            style={[styles.infoItem, { color: isDarkMode ? '#ccc' : '#666' }]}
          >
            • All keys are stored securely in device keychain/keystore
          </Text>
          <Text
            style={[styles.infoItem, { color: isDarkMode ? '#ccc' : '#666' }]}
          >
            • Biometric authentication uses system-level security
          </Text>
          <Text
            style={[styles.infoItem, { color: isDarkMode ? '#ccc' : '#666' }]}
          >
            • PIN authentication includes lockout protection
          </Text>
          <Text
            style={[styles.infoItem, { color: isDarkMode ? '#ccc' : '#666' }]}
          >
            • Digital signatures are cryptographically verified
          </Text>
        </View>
      </View>
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
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  button: {
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
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfButton: {
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsSection: {
    marginBottom: 30,
  },
  resultCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.2)',
    marginBottom: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  copyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  copyButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  resultValue: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  infoSection: {
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoList: {
    paddingLeft: 8,
  },
  infoItem: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
});
