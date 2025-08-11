## React Native Biolink

[![CI](https://github.com/gmemmy/biolink/workflows/CI/badge.svg)](https://github.com/gmemmy/biolink/actions)
[![npm version](https://badge.fury.io/js/%40gmemmy%2Freact-native-biolink.svg)](https://badge.fury.io/js/%40gmemmy%2Freact-native-biolink)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)

Biolink adds biometric authentication, secure storage, and hardware-backed signing to React Native apps using the New Architecture. It is powered by Nitro Modules for direct JSI communication—no traditional bridge.

### Quick links

- **Package**: [`@gmemmy/react-native-biolink`](https://www.npmjs.com/package/@gmemmy/react-native-biolink)
- **API & Usage**: [`packages/react-native-biolink/README.md`](./packages/react-native-biolink/README.md)
- **Demo App**: [`biolink-demo/README.md`](./biolink-demo/README.md)
- **Issues**: [`github.com/gmemmy/biolink/issues`](https://github.com/gmemmy/biolink/issues)
- **Discussions**: [`github.com/gmemmy/biolink/discussions`](https://github.com/gmemmy/biolink/discussions)
- **Contributing**: [`CONTRIBUTING.md`](./CONTRIBUTING.md)

## Installation

This library requires `react-native-nitro-modules`.

```bash
pnpm add @gmemmy/react-native-biolink react-native-nitro-modules
```

## Requirements

- **React Native** ≥ 0.74 with the New Architecture enabled
- **iOS** 13+ (Secure Enclave)
- **Android** API 23+ (Biometric API / Keystore)

## Features

- **Bridge-free**: Direct JSI via Nitro Modules
- **Hardware-backed security**: Secure Enclave (iOS) and Android Keystore
- **Biometric authentication**: Face ID, Touch ID, and device credentials
- **Secure storage**: Keychain (iOS) and Keystore (Android)
- **PIN fallback**: PIN auth with automatic lockout
- **Digital signing**: Hardware-backed keys for request signing

## Roadmap

- **FIDO2/WebAuthn passkeys**
- **Analytics & observability**
- **Expo config plugin**

## Monorepo

- `packages/react-native-biolink`: The library source
- `biolink-demo`: Demo app showcasing the library

## License

MIT — see [`LICENSE`](./LICENSE).
