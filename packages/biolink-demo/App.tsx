import * as React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  useColorScheme,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { authenticate, useAuth } from 'react-native-biolink';

function App() {
  const { isAuthenticated, error, isLoading, clearError } = useAuth();
  const isDarkMode = useColorScheme() === 'dark';

  const handleBiometricsOnly = async () => {
    try {
      clearError();
      const result = await authenticate(false);
      console.log('Biometrics-only authentication result:', result);
    } catch (err) {
      console.error('Biometrics-only authentication failed:', err);
    }
  };

  const handleBiometricsWithFallback = async () => {
    try {
      clearError();
      const result = await authenticate(true);
      console.log('Biometrics with fallback authentication result:', result);
    } catch (err) {
      console.error('Biometrics with fallback authentication failed:', err);
    }
  };

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={[styles.container, backgroundStyle]}
        edges={['top', 'bottom']}
      >
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <View style={styles.content}>
          <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#333' }]}>
            Biolink Demo
          </Text>
          <Text
            style={[styles.subtitle, { color: isDarkMode ? '#ccc' : '#666' }]}
          >
            Biometric Authentication Demo
          </Text>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleBiometricsOnly}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Authenticating...' : 'Biometrics Only'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton, isLoading && styles.buttonDisabled]}
            onPress={handleBiometricsWithFallback}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Authenticating...' : 'Biometrics + Device PIN'}
            </Text>
          </TouchableOpacity>

          <View style={styles.statusContainer}>
            {isAuthenticated && (
              <Text style={styles.successText}>
                ✅ Authenticated Successfully
              </Text>
            )}
            {error && <Text style={styles.errorText}>❌ {error}</Text>}
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 50,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 15,
    minWidth: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  statusContainer: {
    alignItems: 'center',
    minHeight: 60,
    marginTop: 15,
  },
  successText: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: '600',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default App;
