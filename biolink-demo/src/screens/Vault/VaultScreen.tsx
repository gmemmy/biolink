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
  authenticate,
  storeSecret,
  getSecret,
} from '@gmemmy/react-native-biolink';

export default function VaultScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const [note, setNote] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLocked, setIsLocked] = React.useState(true);
  const [savedNote, setSavedNote] = React.useState('');

  const handleSaveNote = async () => {
    if (!note.trim()) {
      Alert.alert('Empty Note', 'Please enter some text to save');
      return;
    }

    setIsLoading(true);

    try {
      await storeSecret('vault-note', note);
      setSavedNote(note);
      Alert.alert('Success', 'Note saved securely to vault!');
    } catch (error) {
      Alert.alert(
        'Save Failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadNote = async () => {
    setIsLoading(true);

    try {
      await authenticate(true);
      const retrievedNote = await getSecret('vault-note');
      setNote(retrievedNote || '');
      setSavedNote(retrievedNote || '');
      setIsLocked(false);
      Alert.alert('Success', 'Note loaded from secure vault!');
    } catch (error) {
      Alert.alert(
        'Authentication Failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearNote = () => {
    Alert.alert(
      'Clear Note',
      'Are you sure you want to clear the current note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setNote('');
            setSavedNote('');
            setIsLocked(true);
          },
        },
      ]
    );
  };

  const handleLockVault = () => {
    setIsLocked(true);
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
        <View style={styles.lockContainer}>
          <Text
            style={[styles.lockIcon, { color: isDarkMode ? '#fff' : '#000' }]}
          >
            {isLocked ? '🔒' : '🔓'}
          </Text>
        </View>
        <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#000' }]}>
          Secure Vault
        </Text>
        <Text
          style={[styles.subtitle, { color: isDarkMode ? '#999' : '#666' }]}
        >
          Store and retrieve sensitive notes with biometric protection
        </Text>
      </View>

      {isLocked ? (
        <View style={styles.lockedSection}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            Vault is Locked
          </Text>
          <Text
            style={[
              styles.sectionDescription,
              { color: isDarkMode ? '#999' : '#666' },
            ]}
          >
            Authenticate with biometrics to access your secure notes
          </Text>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: isDarkMode ? '#007AFF' : '#007AFF' },
            ]}
            onPress={handleLoadNote}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Unlock with Biometrics</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.unlockedSection}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            Secure Note Editor
          </Text>
          <Text
            style={[
              styles.sectionDescription,
              { color: isDarkMode ? '#999' : '#666' },
            ]}
          >
            Your note is encrypted and stored securely
          </Text>

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
            secureTextEntry
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.saveButton,
                { backgroundColor: isDarkMode ? '#34C759' : '#34C759' },
              ]}
              onPress={handleSaveNote}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Save Note</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.clearButton,
                { backgroundColor: isDarkMode ? '#FF3B30' : '#FF3B30' },
              ]}
              onPress={handleClearNote}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Clear Note</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              styles.lockButton,
              { backgroundColor: isDarkMode ? '#333' : '#f0f0f0' },
            ]}
            onPress={handleLockVault}
            disabled={isLoading}
          >
            <Text
              style={[
                styles.buttonText,
                { color: isDarkMode ? '#fff' : '#000' },
              ]}
            >
              Lock Vault
            </Text>
          </TouchableOpacity>

          {savedNote && (
            <View style={styles.savedNoteContainer}>
              <Text
                style={[
                  styles.savedNoteTitle,
                  { color: isDarkMode ? '#fff' : '#000' },
                ]}
              >
                Last Saved Note:
              </Text>
              <Text
                style={[
                  styles.savedNoteText,
                  { color: isDarkMode ? '#ccc' : '#666' },
                ]}
              >
                {savedNote.length > 100
                  ? `${savedNote.substring(0, 100)}...`
                  : savedNote}
              </Text>
            </View>
          )}
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
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  lockContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  lockIcon: {
    fontSize: 40,
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
  lockedSection: {
    alignItems: 'center',
  },
  unlockedSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    flex: 1,
  },
  clearButton: {
    flex: 1,
  },
  lockButton: {
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  noteInput: {
    width: '100%',
    minHeight: 200,
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  savedNoteContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  savedNoteTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  savedNoteText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
