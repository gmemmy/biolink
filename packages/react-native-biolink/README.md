# @gmemmy/react-native-biolink

[![CI](https://github.com/gmemmy/biolink/workflows/CI/badge.svg)](https://github.com/gmemmy/biolink/actions)
[![npm version](https://badge.fury.io/js/%40gmemmy%2Freact-native-biolink.svg)](https://badge.fury.io/js/%40gmemmy%2Freact-native-biolink)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A fast biometric authentication and secure storage module for React Native's new architecture, built on Nitro Modules, with PIN authentication and device credential fallback.

> **📖 Developer Documentation** - This is the complete API reference and developer guide. For a quick overview, see the [README](../../README.md).

## Current Features (v1.0)

- ⚡ **Biometric Authentication** - Face ID, Touch ID, and device credentials
- 🔒 **Secure Storage** - Platform-specific secure storage (iOS Keychain, Android Keystore)
- 🔐 **PIN Authentication** - Fallback PIN with lockout protection and device credential fallback
- ✍️ **Digital Signing** - Hardware-backed RSA key generation and signature creation
- ⚡ **Bridge-Free** - Direct native communication using Nitro modules for maximum performance
- 🎯 **TypeScript** - Full TypeScript support with comprehensive types
- 📱 **Cross-Platform** - iOS and Android support
- 🚀 **Performance Optimized** - Cached operations and minimal overhead
- 🔄 **React Hooks** - Built-in `useAuth` hook for easy integration

## Roadmap

### Phase 6: DX Tooling & Reliability

- **CI/CD & E2E Testing** - Comprehensive test suite with Detox/Appium
- **Expo Config Plugin** - Zero-config setup for Expo projects
- **Enhanced Documentation** - Migration guides and advanced recipes

### Phase 7: Advanced Security & Observability

- **FIDO2/WebAuthn Passkeys** - Full passkey support with RP ID validation
- **Analytics & Observability** - Built-in event tracking and audit logging

## Requirements

- React Native >= 0.74.0 (New Architecture required)
- iOS >= 13.0
- Android API >= 23
- Node.js >= 18.0.0

## Installation

**Important**: This library requires both `@gmemmy/react-native-biolink` and `react-native-nitro-modules` to be installed.

```bash
# Install both packages
pnpm add @gmemmy/react-native-biolink react-native-nitro-modules
npm add @gmemmy/react-native-biolink react-native-nitro-modules
yarn add @gmemmy/react-native-biolink react-native-nitro-modules
```

**Note**: React Native 0.74.0+ is required as this library uses the New Architecture with Nitro modules for bridge-free native communication.

## Quick Start

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
function MyComponent() {
  const { isAuthenticated, authenticate, isLoading, error } = useAuth();

  const handleLogin = async () => {
    await authenticate(true); // with device fallback
  };

  return (
    <button onClick={handleLogin} disabled={isLoading}>
      {isAuthenticated ? 'Authenticated' : 'Login'}
    </button>
  );
}
```

## API Reference

### Authentication

#### `authenticate(fallbackToDeviceCredential?)`

Authenticate using biometrics with optional device credential fallback.

```typescript
// Biometric only
const isAuthenticated = await authenticate();

// With device credential fallback
const isAuthenticated = await authenticate(true);
```

#### `useAuth()`

React hook for managing authentication state.

```typescript
const { isAuthenticated, authenticate, isLoading, error, clearError, reset } =
  useAuth();
```

### Secure Storage

#### `storeSecret(key, value)`

Store a value securely using platform-specific storage.

```typescript
await storeSecret('user-token', 'your-secure-token');
await storeSecret('user-preferences', JSON.stringify({ theme: 'dark' }));
```

#### `getSecret(key)`

Retrieve a securely stored value.

```typescript
const token = await getSecret('user-token');
const preferences = JSON.parse((await getSecret('user-preferences')) || '{}');
```

### PIN Authentication

#### `enrollPin(pin)`

Set a PIN for fallback authentication with lockout protection.

```typescript
await enrollPin('123456');
```

#### `authenticateWithPin(pin)`

Authenticate using PIN with automatic lockout on failed attempts.

```typescript
try {
  await authenticateWithPin('123456');
  console.log('PIN authentication successful');
} catch (error) {
  if (error.code === 'PIN_LOCKED') {
    console.log('PIN is locked, try again later');
  } else if (error.code === 'PIN_INCORRECT') {
    console.log(`${error.remainingAttempts} attempts remaining`);
  }
}
```

#### `getPinLockoutStatus()`

Get the current PIN lockout status.

```typescript
const status = await getPinLockoutStatus();
if (status.isLocked) {
  console.log(`Locked until: ${status.lockoutEndsAt}`);
} else {
  console.log(`${status.remainingAttempts} attempts remaining`);
}
```

#### `clearPinLockout()`

Clear the PIN lockout (useful for testing or admin override).

```typescript
await clearPinLockout();
```

### Digital Signing

#### `getSignatureHeaders(body, headerName?)`

Generate signed headers for API requests.

```typescript
const headers = await getSignatureHeaders({ userId: 123, action: 'login' });
// Returns: { 'X-Body-Signature': 'base64-signature-here' }

// Use with fetch
const response = await fetch('/api/authenticate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...headers,
  },
  body: JSON.stringify({ userId: 123, action: 'login' }),
});
```

#### `getSignatureHeadersWithPublicKey(body, includePublicKey?)`

Generate signed headers with public key included.

```typescript
const headers = await getSignatureHeadersWithPublicKey({ userId: 123 });
// Returns: {
//   'X-Body-Signature': 'base64-signature-here',
//   'X-Public-Key': 'base64-public-key-here'
// }
```

#### `isSigningAvailable()`

Check if signing capabilities are available.

```typescript
const available = await isSigningAvailable();
if (available) {
  // Use signing features
}
```

## Platform Support

| Feature         | iOS                  | Android              |
| --------------- | -------------------- | -------------------- |
| Biometric Auth  | ✅ Face ID, Touch ID | ✅ Fingerprint, Face |
| Secure Storage  | ✅ Keychain          | ✅ Keystore          |
| PIN Auth        | ✅ with lockout      | ✅ with lockout      |
| Device Fallback | ✅                   | ✅                   |
| Digital Signing | ✅ Hardware-backed   | ✅ Hardware-backed   |
| Bridge-Free     | ✅ Nitro Modules     | ✅ Nitro Modules     |

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](https://github.com/gmemmy/biolink)
- 🐛 [Issues](https://github.com/gmemmy/biolink/issues)
- 💬 [Discussions](https://github.com/gmemmy/biolink/discussions)
