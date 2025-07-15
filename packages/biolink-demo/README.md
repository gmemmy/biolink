# Biolink Demo App

A minimal React Native demo app showcasing the Biolink biometric authentication library.

## Features

- **Biometric Authentication**: Demonstrates `signInWithBiometrics()` function
- **React Hook Integration**: Uses `useAuth()` hook for state management
- **Dark/Light Mode**: Supports system theme preferences
- **Error Handling**: Displays authentication errors and success states
- **Modern UI**: Clean, focused interface with loading states

## Built With

- **React Native 0.81.0-rc.0**: Latest React Native with new architecture
- **React 19.1.0**: Latest React with concurrent features
- **TypeScript**: Full type safety
- **Biolink Library**: Custom biometric authentication

## Getting Started

### Prerequisites

- React Native development environment
- iOS/Android development tools
- Node.js 18+
- pnpm package manager

### Installation

From the workspace root:

```bash
pnpm install
pnpm build
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

1. **Authentication Flow**: Press the "Authenticate with Biometrics" button
2. **State Management**: Watch the loading, success, and error states
3. **Error Handling**: See how authentication failures are handled
4. **Integration**: Simple integration with the Biolink library

## Architecture

- **@biolink/js-wrapper**: React Native JavaScript wrapper with hooks
- **@biolink/core-native**: Native iOS/Android biometric authentication
- **Minimal Dependencies**: Only what's needed for the demo

## License

Part of the Biolink library project.
