# React Native Biolink

[![CI](https://github.com/gmemmy/biolink/workflows/CI/badge.svg)](https://github.com/gmemmy/biolink/actions)
[![npm version](https://badge.fury.io/js/%40gmemmy%2Freact-native-biolink.svg)](https://badge.fury.io/js/%40gmemmy%2Freact-native-biolink)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)

A high-performance biometric authentication and secure storage library built on [Nitro Modules](https://nitro.margelo.com) for React Native's New Architecture. Unlike bridge-based libraries, Biolink uses Nitro's JSI implementation for **near-zero latency** native communication.

## NPM Package

**[@gmemmy/react-native-biolink](https://www.npmjs.com/package/@gmemmy/react-native-biolink)**

```bash
npm install @gmemmy/react-native-biolink react-native-nitro-modules
# or
pnpm add @gmemmy/react-native-biolink react-native-nitro-modules
# or
yarn add @gmemmy/react-native-biolink react-native-nitro-modules
```

### Current Features (v1.0)

- **Bridge-Free**: Direct JSI communication with near-zero latency
- **Hardware-Backed Security**: Secure Enclave (iOS) and TEE Keystore (Android)
- **Biometric Authentication**: Face ID, Touch ID, and device credentials
- **Secure Storage**: Platform-specific secure storage (iOS Keychain, Android Keystore)
- **PIN Authentication**: Fallback PIN with lockout protection
- **Digital Signing**: Hardware-backed RSA key generation and signature creation
- **Cross-Platform**: iOS and Android support
- **React Hooks**: Built-in `useAuth` hook for easy integration

### Coming Soon

- **FIDO2/WebAuthn Passkeys**: Full passkey support with RP ID validation
- **Analytics & Observability**: Built-in event tracking and audit logging
- **Expo Config Plugin**: Zero-config setup for Expo projects

## Requirements

- **React Native** ≥ 0.74 (New Architecture required)
- **react-native-nitro-modules**
- **iOS** 13+ (Secure Enclave)
- **Android** API 23+ (Biometric API)

For complete usage examples, API documentation, and advanced features, see the **[📖 Package Documentation](./packages/react-native-biolink/README.md)**.

## Documentation

- **[📖 Full API Documentation](./packages/react-native-biolink/README.md)** - Complete API reference, examples, and advanced usage
- **[📱 Demo App](./biolink-demo/README.md)** - See the library in action
- **[🐛 Issues](https://github.com/gmemmy/biolink/issues)** - Report bugs and request features
- **[💬 Discussions](https://github.com/gmemmy/biolink/discussions)** - Ask questions and share ideas
- **[📋 Contributing Guide](https://github.com/gmemmy/biolink/blob/main/CONTRIBUTING.md)** - How to contribute to the project

## License

MIT License - see [LICENSE](./LICENSE) for details.
