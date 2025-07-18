# Biolink Demo App

A minimal React Native demo app showcasing the current features of the Biolink biometric authentication library.

## Current Features (v1.0)

- **Biometric Authentication**: Demonstrates `signInWithBiometrics()` function with device credential fallback
- **Secure Storage**: Store and retrieve secrets using platform-specific secure storage
- **PIN Authentication**: Complete enrollment and lockout flow with automatic retry limits
- **Digital Signing**: Hardware-backed signature generation for API requests

## Screenshots

### 🔐 Biometric Authentication

<img width="400" height="950" alt="Biometric Authentication" src="https://github.com/user-attachments/assets/02cfe75f-600a-4477-807f-bbda494831c4" />

<img width="400" height="950" alt="Biometric Authentication Successful" src="https://github.com/user-attachments/assets/9617be21-4f8c-4a94-b1d7-ec626512547e" />

### 🔢 Custom PIN Authentication

<img width="400" height="950" alt="Custom PIN Authentication" src="https://github.com/user-attachments/assets/fdd3521d-c232-4926-802f-bf6e7363b1e0" />

<img width="400" height="950" alt="Custom PIN lockout" src="https://github.com/user-attachments/assets/195e8e26-bb8d-4eef-a6f7-956ffcccf406" />

## Built With

- **React Native 0.81.0-rc.0**: Latest React Native with new architecture
- **React 19.1.0**: Latest React with concurrent features
- **TypeScript**: Full type safety
- **react-native-biolink**: Custom biometric authentication library
- **react-native-nitro-modules**: JSI-powered native modules
- **react-native-safe-area-context**: Safe area handling

## Getting Started

### Prerequisites

- React Native development environment
- iOS/Android development tools
- Node.js 18+
- pnpm package manager
- React Native 0.74+ with New Architecture enabled

### Installation

From the workspace root:

```bash
# Install dependencies
pnpm install

# Build the library
pnpm build

# Generate native bindings
cd packages/react-native-biolink && pnpm codegen && cd ../..
```

### Running the Demo

#### iOS

```bash
cd packages/biolink-demo
npx react-native run-ios
```

#### Android

```bash
cd packages/biolink-demo
npx react-native run-android
```

### Development

Start the Metro bundler:

```bash
npx react-native start
```

## How It Works

The demo app demonstrates:

1. **Carousel Navigation**: Swipe or use navigation buttons to explore features
2. **Biometric Authentication**: Two buttons - "Biometrics Only" and "Biometrics + Device PIN"
3. **Secure Storage**: Store and retrieve secrets using platform-specific secure storage
4. **PIN Authentication**: Enroll, authenticate, and test lockout functionality
5. **Digital Signing**: Generate signed headers for API requests

## Future Features

The demo will be expanded to showcase:

- **FIDO2/WebAuthn Passkeys**: Full passkey authentication flows
- **Analytics Integration**: Event tracking and audit logging
- **Advanced Security**: Multi-factor authentication and compliance features
