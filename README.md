# React Native Biolink

A **bridge-free** biometric authentication and secure storage library built on Nitro Modules for React Native 0.74+ with new Architecture enabled.

[![CI](https://github.com/gmemmy/biolink/workflows/CI/badge.svg)](https://github.com/gmemmy/biolink/actions)
[![npm version](https://badge.fury.io/js/%40gmemmy%2Freact-native-biolink.svg)](https://badge.fury.io/js/%40gmemmy%2Freact-native-biolink)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)

## 📦 NPM Package

**[@gmemmy/react-native-biolink](https://www.npmjs.com/package/@gmemmy/react-native-biolink)**

```bash
npm install @gmemmy/react-native-biolink react-native-nitro-modules
# or
pnpm add @gmemmy/react-native-biolink react-native-nitro-modules
# or
yarn add @gmemmy/react-native-biolink react-native-nitro-modules
```

## 🚀 Overview

**React Native Biolink** is a high-performance biometric authentication and secure storage library built on [Nitro Modules](https://nitro.margelo.com) for React Native's New Architecture. Unlike bridge-based libraries, Biolink uses Nitro's JSI implementation for **near-zero latency** native communication.

### Key Features

- **🔗 Bridge-Free**: Direct JSI communication with near-zero latency
- **🔐 Hardware-Backed Security**: Secure Enclave (iOS) and TEE Keystore (Android)
- **⚡ Biometric Authentication**: Face ID, Touch ID, and device credentials
- **🔒 Secure Storage**: Platform-specific secure storage (iOS Keychain, Android Keystore)
- **🔐 PIN Authentication**: Fallback PIN with lockout protection
- **✍️ Digital Signing**: Hardware-backed RSA key generation and signature creation
- **🎯 TypeScript**: Full TypeScript support with comprehensive types
- **📱 Cross-Platform**: iOS and Android support
- **🔄 React Hooks**: Built-in `useAuth` hook for easy integration

## 📋 Requirements

- **React Native** ≥ 0.74 (New Architecture required)
- **react-native-nitro-modules**
- **iOS** 13+ (Secure Enclave)
- **Android** API 23+ (Biometric API)
- **Node.js** ≥ 18.0.0

## 🛠️ Quick Start

```typescript
import {
  authenticate,
  storeSecret,
  getSecret,
  getSignatureHeaders,
  useAuth
} from '@gmemmy/react-native-biolink';

// Biometric authentication with device fallback
const isAuthenticated = await authenticate(true);

// Secure storage
await storeSecret('user-token', 'your-secure-token');
const token = await getSecret('user-token');

// Digital signing for API requests
const headers = await getSignatureHeaders({ userId: 123, action: 'login' });

// React hook for authentication state
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

function MyComponent() {
  const { isAuthenticated, authenticate, isLoading, error } = useAuth();

  const handleLogin = async () => {
    await authenticate(true); // with device fallback
  };

  return (
    <TouchableOpacity
      onPress={handleLogin}
      disabled={isLoading}
      style={{
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        opacity: isLoading ? 0.6 : 1
      }}
    >
      {isLoading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
          {isAuthenticated ? 'Authenticated' : 'Login with Biometrics'}
        </Text>
      )}
    </TouchableOpacity>
  );
}
```

## 📚 Documentation

- **[📖 Full API Documentation](./packages/react-native-biolink/README.md)** - Complete API reference, examples, and advanced usage
- **[📱 Demo App](./biolink-demo/README.md)** - See the library in action
- **[🐛 Issues](https://github.com/gmemmy/biolink/issues)** - Report bugs and request features
- **[💬 Discussions](https://github.com/gmemmy/biolink/discussions)** - Ask questions and share ideas

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.
