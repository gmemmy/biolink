# Biolink

A high-performance React Native library for biometric authentication and secure data storage, built for the **New Architecture**.

## Requirements

- React Native 0.70+ with New Architecture enabled
- iOS 12.0+
- Android API 23+

## Features

- 🔐 Biometric authentication (Face ID, Touch ID, Fingerprint)
- 🗝️ Secure keychain/keystore data storage
- ⚡ Ultra-fast native performance (no bridge!)
- 🏗️ Built for React Native's New Architecture
- 🍎 iOS and Android support

## Built with Nitro Modules

This library is powered by [Nitro Modules](https://nitro.margelo.com) for maximum performance and seamless native integration.

![Nitro](https://img.shields.io/badge/Built_with-Nitro_Modules-blue?style=flat&logo=rocket)

## Quick Start

```typescript
import { BiolinkCore } from 'react-native-biolink';

// Authenticate with biometrics
const isAuthenticated = await BiolinkCore.authenticate();

// Store secure data
await BiolinkCore.storeSecret('user-token', 'your-secret-data');

// Retrieve secure data
const secret = await BiolinkCore.getSecret('user-token');
```

## Demo

See the `packages/biolink-demo/` directory for a complete example implementation.

## Documentation

More comprehensive documentation coming soon.
