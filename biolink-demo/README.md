## Biolink Demo App

A React Native app that showcases the Biolink library: biometrics, secure storage, PIN fallback, and hardware-backed signing.

## Features

- **Biometric authentication** with optional device credential fallback
- **Secure storage** via Keychain/Keystore
- **PIN authentication** with enrollment and lockout
- **Digital signing** for API requests

## Screenshots

### 🔐 Biometric Authentication

![Android](https://github.com/user-attachments/assets/7aa03529-9024-4627-b3d1-0267e5037a18)
![iOS](https://github.com/user-attachments/assets/6a9ac49a-be51-4e65-832d-1953dd6c0cfc)

## Built with

- **React Native 0.80.1** (New Architecture)
- **React 19.1.0**
- **TypeScript**
- **@gmemmy/react-native-biolink** (library)
- **react-native-nitro-modules** (JSI)
- **react-native-safe-area-context**

## Getting started

### Prerequisites

- React Native dev environment (iOS/Android)
- Node.js 18+
- pnpm
- React Native 0.74+ with New Architecture enabled

### Install & build (from workspace root)

```bash
# Install dependencies
pnpm install

# Build the library
pnpm build

# Generate native bindings for the library
cd packages/react-native-biolink && pnpm codegen && cd ../..
```

### Run the demo

#### iOS

```bash
cd biolink-demo
npx react-native run-ios
```

#### Android

```bash
cd biolink-demo
npx react-native run-android
```

### Development

Start Metro from the repo root or the app folder:

```bash
npx react-native start
```

## What’s inside

- **Carousel navigation** to explore each capability
- **Biometric auth**: "Biometrics only" and "Biometrics + Device PIN"
- **Secure storage** examples
- **PIN flow**: enroll, authenticate, lockout
- **Digital signing**: create signed headers for API calls

## Planned additions

- **FIDO2/WebAuthn passkeys**
- **Analytics & audit logging**
- **Advanced security** (MFA, compliance)
