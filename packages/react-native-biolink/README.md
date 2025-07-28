# @gmemmy/react-native-biolink

[![CI](https://github.com/gmemmy/biolink/workflows/CI/badge.svg)](https://github.com/gmemmy/biolink/actions)
[![npm version](https://badge.fury.io/js/%40gmemmy%2Freact-native-biolink.svg)](https://badge.fury.io/js/%40gmemmy%2Freact-native-biolink)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This document provides the complete API reference and developer guide for `@gmemmy/react-native-biolink`, a fast biometric authentication and secure storage module for React Native's New Architecture. For a high-level overview of the project, including features, roadmap, and general requirements, please refer to the [main project README](../../README.md).

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
import { TouchableOpacity, Text } from 'react-native'; // Import for React Native components

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
    <TouchableOpacity onPress={handleLogin} disabled={isLoading}>
      <Text>{isAuthenticated ? 'Authenticated' : 'Login'}</Text>
    </TouchableOpacity>
  );
}
```

## API Reference

### Authentication

#### `authenticate(fallbackToDeviceCredential?: boolean)`

Authenticates the user using biometrics (Face ID, Touch ID, Fingerprint). If `fallbackToDeviceCredential` is set to `true`, the system will allow the user to fall back to their device PIN, pattern, or password if biometrics are not available or fail.

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

#### `storeSecret(key: string, value: string)`

Stores a `value` securely using platform-specific storage (iOS Keychain, Android Keystore) associated with a given `key`.

> **Note**: While the library handles encryption, it's generally recommended to keep stored secrets concise. Avoid storing extremely large data blobs.

```typescript
await storeSecret('user-token', 'your-secure-token');
await storeSecret('user-preferences', JSON.stringify({ theme: 'dark' }));
```

#### `getSecret(key: string)`

Retrieves a securely stored value associated with a given `key` from platform-specific storage.

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

#### `authenticateWithPin(pin: string)`

Authenticates the user using a previously enrolled PIN. This function includes automatic lockout on failed attempts.

```typescript
try {
  await authenticateWithPin('123456');
  console.log('PIN authentication successful');
} catch (error) {
  if (error.code === 'PIN_LOCKED') {
    console.log('PIN is locked, try again later');
  } else if (error.code === 'PIN_INCORRECT') {
    console.log(`${error.remainingAttempts} attempts remaining`);
  } else {
    console.error('Authentication failed:', error.message);
  }
}
```

> **Error Codes for `authenticateWithPin`**:
>
> - `PIN_LOCKED`: The PIN is temporarily locked due to too many failed attempts. Check `getPinLockoutStatus()` for details.
> - `PIN_INCORRECT`: The provided PIN is incorrect. The error object will contain `remainingAttempts`.
> - Other errors: General authentication failures.

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

Digital signing uses hardware-backed keys to create cryptographic signatures for data, ensuring its integrity and authenticity. This is useful for verifying that data has not been tampered with and originates from a trusted source.

#### `getSignatureHeaders(body: object, headerName?: string)`

Generates a cryptographic signature for the provided `body` object using a hardware-backed key and returns it as an HTTP header. This ensures the integrity and authenticity of the data sent in API requests.

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

#### `getSignatureHeadersWithPublicKey(body: object, includePublicKey?: boolean)`

Generates a cryptographic signature for the provided `body` object and includes the public key in the returned HTTP headers. This allows the recipient to verify the signature and the origin of the data.

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
