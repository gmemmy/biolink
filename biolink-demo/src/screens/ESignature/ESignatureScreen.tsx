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
import { getSignatureHeadersWithPublicKey } from '@gmemmy/react-native-biolink';

type ManifestStatus = 'pending' | 'signed' | 'error';

export default function ESignatureScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const [manifest, setManifest] = React.useState({
    id: 'manifest-001',
    title: 'Software Update Agreement',
    version: '2.1.0',
    timestamp: Date.now(),
    changes: [
      'Enhanced security features',
      'Improved performance',
      'Bug fixes and stability improvements',
      'New user interface elements',
    ],
    requiresApproval: true,
  });
  const [signature, setSignature] = React.useState('');
  const [publicKey, setPublicKey] = React.useState('');
  const [status, setStatus] = React.useState<ManifestStatus>('pending');
  const [isLoading, setIsLoading] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);

  const handleApprove = async () => {
    setIsLoading(true);
    setStatus('pending');

    try {
      const manifestString = JSON.stringify(manifest, null, 2);
      const headers = await getSignatureHeadersWithPublicKey(manifestString);
      setPublicKey(headers['X-Public-Key'] || '');
      setSignature(headers['X-Body-Signature'] || '');
      setStatus('signed');

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      Alert.alert('Success', 'Manifest signed successfully!');
    } catch (error) {
      setStatus('error');
      Alert.alert(
        'Signing Failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setManifest({
      ...manifest,
      id: `manifest-${Math.random().toString(36).substring(7)}`,
      timestamp: Date.now(),
      version: `${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
    });
    setSignature('');
    setPublicKey('');
    setStatus('pending');
  };

  const copyToClipboard = (text: string, label: string) => {
    Alert.alert('Copied', `${label} copied to clipboard`);
  };

  const getStatusColor = () => {
    switch (status) {
      case 'signed':
        return '#34C759';
      case 'error':
        return '#FF3B30';
      default:
        return '#FF9500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'signed':
        return '✓ Signed';
      case 'error':
        return '✗ Error';
      default:
        return '⏳ Pending';
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
          ✍️ E-Signature Approval
        </Text>
        <Text
          style={[styles.subtitle, { color: isDarkMode ? '#999' : '#666' }]}
        >
          Sign digital documents with cryptographic verification
        </Text>
      </View>

      <View style={styles.manifestSection}>
        <View style={styles.manifestHeader}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            Document Manifest
          </Text>
          <View
            style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}
          >
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
        </View>

        <View
          style={[
            styles.manifestCard,
            { backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f9fa' },
          ]}
        >
          <Text
            style={[
              styles.manifestTitle,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            {manifest.title}
          </Text>
          <Text
            style={[
              styles.manifestVersion,
              { color: isDarkMode ? '#999' : '#666' },
            ]}
          >
            Version {manifest.version}
          </Text>
          <Text
            style={[styles.manifestId, { color: isDarkMode ? '#999' : '#666' }]}
          >
            ID: {manifest.id}
          </Text>
          <Text
            style={[
              styles.manifestTimestamp,
              { color: isDarkMode ? '#999' : '#666' },
            ]}
          >
            {new Date(manifest.timestamp).toLocaleString()}
          </Text>

          <Text
            style={[
              styles.changesTitle,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            Changes in this version:
          </Text>
          {manifest.changes.map((change, index) => (
            <Text
              key={`change-${change.substring(0, 10)}-${index}`}
              style={[
                styles.changeItem,
                { color: isDarkMode ? '#ccc' : '#666' },
              ]}
            >
              • {change}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.actionSection}>
        <TouchableOpacity
          style={[
            styles.approveButton,
            { backgroundColor: isDarkMode ? '#34C759' : '#34C759' },
          ]}
          onPress={handleApprove}
          disabled={isLoading || status === 'signed'}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.approveButtonText}>
              {status === 'signed' ? 'Already Signed' : 'Approve & Sign'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.resetButton,
            { backgroundColor: isDarkMode ? '#333' : '#f0f0f0' },
          ]}
          onPress={handleReset}
          disabled={isLoading}
        >
          <Text
            style={[
              styles.resetButtonText,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            Reset Manifest
          </Text>
        </TouchableOpacity>
      </View>

      {signature && (
        <View style={styles.signatureSection}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            Digital Signature
          </Text>

          <View
            style={[
              styles.signatureCard,
              { backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f9fa' },
            ]}
          >
            <View style={styles.signatureHeader}>
              <Text style={styles.signatureLabel}>Public Key:</Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => copyToClipboard(publicKey, 'Public Key')}
              >
                <Text style={styles.copyButtonText}>Copy</Text>
              </TouchableOpacity>
            </View>
            <Text
              style={[
                styles.signatureValue,
                { color: isDarkMode ? '#ccc' : '#666' },
              ]}
            >
              {publicKey.substring(0, 50)}...
            </Text>

            <View style={styles.signatureHeader}>
              <Text style={styles.signatureLabel}>Signature:</Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => copyToClipboard(signature, 'Signature')}
              >
                <Text style={styles.copyButtonText}>Copy</Text>
              </TouchableOpacity>
            </View>
            <Text
              style={[
                styles.signatureValue,
                { color: isDarkMode ? '#ccc' : '#666' },
              ]}
            >
              {signature.substring(0, 50)}...
            </Text>
          </View>

          {showSuccess && (
            <View style={styles.successOverlay}>
              <Text style={styles.successText}>✅ Document Signed!</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.infoSection}>
        <Text
          style={[styles.infoTitle, { color: isDarkMode ? '#fff' : '#000' }]}
        >
          🔐 Security Features
        </Text>
        <View style={styles.infoList}>
          <Text
            style={[styles.infoItem, { color: isDarkMode ? '#ccc' : '#666' }]}
          >
            • Cryptographic signatures using device keys
          </Text>
          <Text
            style={[styles.infoItem, { color: isDarkMode ? '#ccc' : '#666' }]}
          >
            • Tamper-evident document verification
          </Text>
          <Text
            style={[styles.infoItem, { color: isDarkMode ? '#ccc' : '#666' }]}
          >
            • Timestamped approval records
          </Text>
          <Text
            style={[styles.infoItem, { color: isDarkMode ? '#ccc' : '#666' }]}
          >
            • Non-repudiation guarantees
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
  manifestSection: {
    marginBottom: 30,
  },
  manifestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
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
  manifestCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.2)',
  },
  manifestTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  manifestVersion: {
    fontSize: 14,
    marginBottom: 4,
  },
  manifestId: {
    fontSize: 12,
    marginBottom: 4,
  },
  manifestTimestamp: {
    fontSize: 12,
    marginBottom: 16,
  },
  changesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  changeItem: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  actionSection: {
    marginBottom: 30,
  },
  approveButton: {
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
  approveButtonText: {
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
  signatureSection: {
    marginBottom: 30,
    position: 'relative',
  },
  signatureCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(52, 199, 89, 0.2)',
  },
  signatureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  signatureLabel: {
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
  signatureValue: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 16,
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(52, 199, 89, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  successText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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
