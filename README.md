# React Native Biolink

A **bridge-free** biometric authentication and secure storage library built on Nitro Modules for React Native 0.74+.

[![Nitro](https://img.shields.io/badge/Built_with-Nitro_Modules-blue?style=flat&logo=rocket)](https://nitro.margelo.com)
[![React Native](https://img.shields.io/badge/React_Native-0.74+-blue?style=flat&logo=react)](https://reactnative.dev)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)

## 🚀 Library Overview

**React Native Biolink** is a high-performance biometric authentication and secure storage library built on [Nitro Modules](https://nitro.margelo.com) for React Native's New Architecture. Unlike bridge-based libraries, Biolink uses Nitro's JSI implementation for **near-zero latency** native communication.

### What Makes It Special

- **🔗 Bridge-Free**: Direct JSI communication
- **⚡ Ultra-Fast**: Near-zero call latency
- **🔐 Hardware-Backed**: Secure Enclave (iOS) and TEE Keystore (Android)
- **🎯 Type-Safe**: Full TypeScript with generated bindings
- **🏗️ New Architecture Ready**: Built on Nitro Modules for React Native 0.74+

## ✨ Key Features & Benefits

### **Promise-Based API**

```typescript
// Simple, unified API
await authenticate(fallbackToDeviceCredential?: boolean)
await storeSecret(key: string, value: string)
const secret = await getSecret(key: string)
```

### **Hardware-Backed Security**

- **iOS**: Secure Enclave with Face ID/Touch ID
- **Android**: TEE Keystore
- **Fallback**: Device credential (PIN/pattern)
- **PIN Auth**: App-managed PIN with lockout

### **Headless Design**

- **No Bundled UI**: Custom authentication flows
- **Flexible**: Any UI framework
- **React Hooks**: `useAuth()` for state management

### **Performance Edge**

- **JSI First**: Direct native communication
- **Near-Zero Latency**: Millisecond operations
- **Memory Efficient**: No bridge overhead

### **Developer Experience**

- **Pluggable Logging**: Customizable audit events
- **Error Handling**: Comprehensive error types
- **Testing Support**: Built-in utilities

## 📋 Requirements

- **React Native** ≥ 0.74 (New Architecture)
- **react-native-nitro-modules**
- **iOS** 11+ (Secure Enclave)
- **Android** API 23+ (Biometric API)
- **PNPM** or **Yarn** workspaces

## 🛠️ Installation & Quickstart

### 1. Install

```bash
# Add to workspace
pnpm add react-native-biolink react-native-nitro-modules

# Or with yarn
yarn add react-native-biolink react-native-nitro-modules
```

### 2. Generate Bindings

```bash
# Run Nitrogen codegen
npx nitrogen

# Or with pnpm
pnpm nitrogen
```

### 3. Rebuild Apps

```bash
# iOS
cd ios && pod install && cd ..
npx react-native run-ios

# Android
npx react-native run-android
```

### 4. Basic Usage

```typescript
import { authenticate, storeSecret, getSecret } from 'react-native-biolink';

const handleLogin = async () => {
  try {
    const isAuthenticated = await authenticate(true); // with fallback

    if (isAuthenticated) {
      await storeSecret('user-token', 'your-secret-data');
      const token = await getSecret('user-token');
      console.log('Retrieved token:', token);
    }
  } catch (error) {
    console.error('Authentication failed:', error);
  }
};
```

### 5. React Hook Usage

```typescript
import { useAuth } from 'react-native-biolink';

function LoginScreen() {
  const { isAuthenticated, error, isLoading, authenticate } = useAuth();

  const handleBiometricAuth = () => {
    authenticate(true); // with device credential fallback
  };

  return (
    <Button
      onPress={handleBiometricAuth}
      disabled={isLoading}
      title={isLoading ? 'Authenticating...' : 'Sign In with Biometrics'}
    />
  );
}
```

## 📚 Next Steps & Documentation

For detailed developer documentation, API reference, and advanced usage examples, see:

**[📖 Developer Documentation →](./packages/react-native-biolink/README.md)**

## 🎯 Demo App

See the complete implementation in action:

**[📱 Demo App Documentation →](./packages/biolink-demo/README.md)**

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

---
