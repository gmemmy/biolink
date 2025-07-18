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
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import {
  authenticate,
  storeSecret,
  getSecret,
} from '@gmemmy/react-native-biolink';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type VaultState = 'locked' | 'unlocking' | 'unlocked' | 'editing' | 'saving';

export default function SecureVaultScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const [vaultState, setVaultState] = React.useState<VaultState>('locked');
  const [note, setNote] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);

  React.useEffect(() => {
    loadSavedNote();
  }, []);

  const loadSavedNote = async () => {
    try {
      const savedNote = await getSecret('secure-vault-note');
      if (savedNote) {
        setNote(savedNote);
      }
    } catch (error) {
      console.error('Error loading saved note:', error);
    }
  };

  const handleUnlockVault = async () => {
    setVaultState('unlocking');
    setIsLoading(true);

    try {
      await authenticate(true);
      setVaultState('unlocked');
      Alert.alert('Vault Unlocked', 'Welcome to your secure vault!');
    } catch (error) {
      setVaultState('locked');
      Alert.alert(
        'Authentication Failed',
        error instanceof Error ? error.message : 'Please try again'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLockVault = () => {
    setVaultState('locked');
    Alert.alert('Vault Locked', 'Your vault has been secured');
  };

  const handleEditNote = () => {
    setVaultState('editing');
  };

  const handleSaveNote = async () => {
    if (!note.trim()) {
      Alert.alert('Empty Note', 'Please enter some content to save');
      return;
    }

    setVaultState('saving');
    setIsLoading(true);

    try {
      await storeSecret('secure-vault-note', note);
      setVaultState('unlocked');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      Alert.alert('Success', 'Note saved securely to vault!');
    } catch (error) {
      setVaultState('editing');
      Alert.alert(
        'Save Failed',
        error instanceof Error ? error.message : 'Please try again'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setVaultState('unlocked');
  };

  const renderLockedState = () => (
    <View style={styles.lockedContainer}>
      <View style={styles.lockIconContainer}>
        <Text style={styles.lockIcon}>🔒</Text>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        )}
      </View>

      <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#000' }]}>
        Secure Vault
      </Text>
      <Text style={[styles.subtitle, { color: isDarkMode ? '#999' : '#666' }]}>
        Secure your private notes with biometric authentication
      </Text>

      <TouchableOpacity
        style={[
          styles.unlockButton,
          { backgroundColor: isDarkMode ? '#007AFF' : '#007AFF' },
        ]}
        onPress={handleUnlockVault}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.unlockButtonText}>Unlock with Biometrics</Text>
        )}
      </TouchableOpacity>

      <View style={styles.securityInfo}>
        <Text
          style={[
            styles.securityTitle,
            { color: isDarkMode ? '#fff' : '#000' },
          ]}
        >
          🔐 Security Features
        </Text>
        <Text
          style={[styles.securityItem, { color: isDarkMode ? '#ccc' : '#666' }]}
        >
          • Biometric authentication required
        </Text>
        <Text
          style={[styles.securityItem, { color: isDarkMode ? '#ccc' : '#666' }]}
        >
          • Notes encrypted with device keys
        </Text>
        <Text
          style={[styles.securityItem, { color: isDarkMode ? '#ccc' : '#666' }]}
        >
          • Data never leaves your device
        </Text>
      </View>
    </View>
  );

  const renderUnlockedState = () => (
    <View style={styles.unlockedContainer}>
      <View style={styles.vaultHeader}>
        <Text
          style={[styles.vaultTitle, { color: isDarkMode ? '#fff' : '#000' }]}
        >
          Your Secure Note
        </Text>
        <TouchableOpacity
          style={[
            styles.lockButton,
            { backgroundColor: isDarkMode ? '#333' : '#f0f0f0' },
          ]}
          onPress={handleLockVault}
        >
          <Text
            style={[
              styles.lockButtonText,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            🔒 Lock
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.noteContainer,
          { backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f9fa' },
        ]}
      >
        <ScrollView style={styles.noteScroll}>
          <Text
            style={[styles.noteText, { color: isDarkMode ? '#fff' : '#000' }]}
          >
            {note ||
              'No note saved yet. Tap Edit to create your first secure note.'}
          </Text>
        </ScrollView>
      </View>

      <TouchableOpacity
        style={[
          styles.editButton,
          { backgroundColor: isDarkMode ? '#34C759' : '#34C759' },
        ]}
        onPress={handleEditNote}
      >
        <Text style={styles.editButtonText}>✏️ Edit Note</Text>
      </TouchableOpacity>

      {showSuccess && (
        <View style={styles.successToast}>
          <Text style={styles.successText}>✅ Saved securely!</Text>
        </View>
      )}
    </View>
  );

  const renderEditingState = () => (
    <KeyboardAvoidingView
      style={styles.editingContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.editingHeader}>
        <Text
          style={[styles.editingTitle, { color: isDarkMode ? '#fff' : '#000' }]}
        >
          Edit Secure Note
        </Text>
        <View style={styles.editingButtons}>
          <TouchableOpacity
            style={[
              styles.cancelButton,
              { backgroundColor: isDarkMode ? '#333' : '#f0f0f0' },
            ]}
            onPress={handleCancelEdit}
            disabled={isLoading}
          >
            <Text
              style={[
                styles.cancelButtonText,
                { color: isDarkMode ? '#fff' : '#000' },
              ]}
            >
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: isDarkMode ? '#007AFF' : '#007AFF' },
            ]}
            onPress={handleSaveNote}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <TextInput
        style={[
          styles.noteInput,
          {
            backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
            color: isDarkMode ? '#fff' : '#000',
            borderColor: isDarkMode ? '#333' : '#ddd',
          },
        ]}
        value={note}
        onChangeText={setNote}
        placeholder="Enter your secure note here..."
        placeholderTextColor={isDarkMode ? '#666' : '#999'}
        multiline
        textAlignVertical="top"
        autoFocus
      />

      <View style={styles.editingInfo}>
        <Text
          style={[styles.infoText, { color: isDarkMode ? '#999' : '#666' }]}
        >
          💡 Your note will be encrypted and stored securely
        </Text>
      </View>
    </KeyboardAvoidingView>
  );

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#000' : '#fff' },
      ]}
      contentContainerStyle={styles.contentContainer}
    >
      {vaultState === 'locked' && renderLockedState()}
      {vaultState === 'unlocked' && renderUnlockedState()}
      {vaultState === 'editing' && renderEditingState()}
      {vaultState === 'unlocking' && (
        <View style={styles.fullScreenOverlay}>
          <BlurView
            style={styles.blurOverlay}
            blurType={isDarkMode ? 'dark' : 'light'}
            blurAmount={10}
          >
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text
                style={[
                  styles.loadingText,
                  { color: isDarkMode ? '#fff' : '#000' },
                ]}
              >
                Authenticating...
              </Text>
            </View>
          </BlurView>
        </View>
      )}
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
    minHeight: SCREEN_HEIGHT - 200,
  },
  lockedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIconContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  lockIcon: {
    fontSize: 60,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  unlockButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unlockButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  securityInfo: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
  },
  securityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  securityItem: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
  },
  unlockedContainer: {
    flex: 1,
  },
  vaultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  vaultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  lockButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  lockButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  noteContainer: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.2)',
    marginBottom: 20,
    minHeight: 200,
  },
  noteScroll: {
    flex: 1,
  },
  noteText: {
    fontSize: 16,
    lineHeight: 24,
  },
  editButton: {
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
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  successToast: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(52, 199, 89, 0.9)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  successText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  editingContainer: {
    flex: 1,
  },
  editingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  editingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  editingButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  noteInput: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    textAlignVertical: 'top',
    minHeight: 300,
  },
  editingInfo: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
  },
  fullScreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  blurOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    padding: 40,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
});
