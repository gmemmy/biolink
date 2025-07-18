import * as React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import {
  getSignatureHeaders,
  getSignatureHeadersWithPublicKey,
} from '@gmemmy/react-native-biolink';

type RequestStatus = 'idle' | 'sending' | 'success' | 'error';

export default function SignedFetchScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [requestStatus, setRequestStatus] =
    React.useState<RequestStatus>('idle');
  const [headers, setHeaders] = React.useState<Record<string, string>>({});
  const [response, setResponse] = React.useState('');
  const [includePublicKey, setIncludePublicKey] = React.useState(false);

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter your name');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email');
      return false;
    }
    if (!email.includes('@')) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }
    return true;
  };

  const mockFetchWithHeaders = async (
    payload: object,
    headers: Record<string, string>
  ): Promise<string> => {
    await new Promise<void>(resolve => setTimeout(resolve, 2000));

    const mockResponse = {
      success: true,
      timestamp: Date.now(),
      receivedHeaders: headers,
      receivedPayload: payload,
      message: 'Request processed successfully with signed headers',
      serverSignature: `mock-server-signature-${Math.random().toString(36).substring(7)}`,
    };

    return JSON.stringify(mockResponse, null, 2);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setRequestStatus('sending');

    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        timestamp: Date.now(),
        action: 'user_registration',
      };

      const payloadString = JSON.stringify(payload);
      let signatureHeadersResult: Record<string, string>;

      if (includePublicKey) {
        signatureHeadersResult =
          await getSignatureHeadersWithPublicKey(payloadString);
      } else {
        signatureHeadersResult = await getSignatureHeaders(payloadString);
      }

      setHeaders(signatureHeadersResult);

      const responseData = await mockFetchWithHeaders(
        payload,
        signatureHeadersResult
      );
      setResponse(responseData);
      setRequestStatus('success');

      Alert.alert('Success', 'Request sent successfully with signed headers!');
    } catch (error) {
      setRequestStatus('error');
      Alert.alert(
        'Request Failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
    } finally {
      setRequestStatus('idle');
    }
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setHeaders({});
    setResponse('');
    setRequestStatus('idle');
  };

  const copyToClipboard = (text: string, label: string) => {
    Alert.alert('Copied', `${label} copied to clipboard`);
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
          🔐 Signed-Fetch Integration
        </Text>
        <Text
          style={[styles.subtitle, { color: isDarkMode ? '#999' : '#666' }]}
        >
          Send authenticated requests with cryptographic signatures
        </Text>
      </View>

      <View style={styles.formSection}>
        <Text
          style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#000' }]}
        >
          Request Form
        </Text>

        <View style={styles.inputContainer}>
          <Text
            style={[styles.inputLabel, { color: isDarkMode ? '#fff' : '#000' }]}
          >
            Name
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
                color: isDarkMode ? '#fff' : '#000',
                borderColor: isDarkMode ? '#333' : '#ddd',
              },
            ]}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={isDarkMode ? '#666' : '#999'}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text
            style={[styles.inputLabel, { color: isDarkMode ? '#fff' : '#000' }]}
          >
            Email
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
                color: isDarkMode ? '#fff' : '#000',
                borderColor: isDarkMode ? '#333' : '#ddd',
              },
            ]}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor={isDarkMode ? '#666' : '#999'}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={[
              styles.checkbox,
              includePublicKey && {
                backgroundColor: isDarkMode ? '#007AFF' : '#007AFF',
              },
            ]}
            onPress={() => setIncludePublicKey(!includePublicKey)}
          >
            {includePublicKey && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
          <Text
            style={[
              styles.checkboxLabel,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            Include public key in headers
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: isDarkMode ? '#34C759' : '#34C759' },
            ]}
            onPress={handleSubmit}
            disabled={requestStatus === 'sending'}
          >
            {requestStatus === 'sending' ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Send Signed Request</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.resetButton,
              { backgroundColor: isDarkMode ? '#333' : '#f0f0f0' },
            ]}
            onPress={handleReset}
            disabled={requestStatus === 'sending'}
          >
            <Text
              style={[
                styles.resetButtonText,
                { color: isDarkMode ? '#fff' : '#000' },
              ]}
            >
              Reset Form
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {Object.keys(headers).length > 0 && (
        <View style={styles.headersSection}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            Request Headers
          </Text>

          <View
            style={[
              styles.headersCard,
              { backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f9fa' },
            ]}
          >
            {Object.entries(headers).map(([key, value]) => (
              <View key={`header-${key}`} style={styles.headerItem}>
                <View style={styles.headerKeyValue}>
                  <Text
                    style={[
                      styles.headerKey,
                      { color: isDarkMode ? '#007AFF' : '#007AFF' },
                    ]}
                  >
                    {key}:
                  </Text>
                  <Text
                    style={[
                      styles.headerValue,
                      { color: isDarkMode ? '#ccc' : '#666' },
                    ]}
                  >
                    {value.length > 50 ? `${value.substring(0, 50)}...` : value}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() => copyToClipboard(value, key)}
                >
                  <Text style={styles.copyButtonText}>Copy</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      {response && (
        <View style={styles.responseSection}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            Server Response
          </Text>

          <View
            style={[
              styles.responseCard,
              { backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f9fa' },
            ]}
          >
            <ScrollView style={styles.responseScroll}>
              <Text
                style={[
                  styles.responseText,
                  { color: isDarkMode ? '#ccc' : '#666' },
                ]}
              >
                {response}
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => copyToClipboard(response, 'Response')}
            >
              <Text style={styles.copyButtonText}>Copy Response</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.infoSection}>
        <Text
          style={[styles.infoTitle, { color: isDarkMode ? '#fff' : '#000' }]}
        >
          🔐 How It Works
        </Text>
        <View style={styles.infoList}>
          <Text
            style={[styles.infoItem, { color: isDarkMode ? '#ccc' : '#666' }]}
          >
            • Request payload is cryptographically signed
          </Text>
          <Text
            style={[styles.infoItem, { color: isDarkMode ? '#ccc' : '#666' }]}
          >
            • Headers include signature and timestamp
          </Text>
          <Text
            style={[styles.infoItem, { color: isDarkMode ? '#ccc' : '#666' }]}
          >
            • Server can verify request authenticity
          </Text>
          <Text
            style={[styles.infoItem, { color: isDarkMode ? '#ccc' : '#666' }]}
          >
            • Prevents tampering and replay attacks
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
  formSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderRadius: 12,
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
  },
  buttonContainer: {
    gap: 12,
  },
  submitButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headersSection: {
    marginBottom: 30,
  },
  headersCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.2)',
  },
  headerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerKeyValue: {
    flex: 1,
  },
  headerKey: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  headerValue: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  copyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 12,
  },
  copyButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  responseSection: {
    marginBottom: 30,
  },
  responseCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(52, 199, 89, 0.2)',
  },
  responseScroll: {
    maxHeight: 200,
    marginBottom: 12,
  },
  responseText: {
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 18,
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
