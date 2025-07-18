---
name: 🐛 Bug Report
about: Create a report to help us improve
title: '[BUG] '
labels: ['bug', 'needs-triage']
assignees: ['gmemmy']
---

## 🐛 Bug Description

A clear and concise description of what the bug is.

## 🔄 Steps to Reproduce

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## ✅ Expected Behavior

A clear and concise description of what you expected to happen.

## ❌ Actual Behavior

A clear and concise description of what actually happened.

## 📱 Environment

### Device Information

- **Device**: [e.g. iPhone 14, Samsung Galaxy S23]
- **OS Version**: [e.g. iOS 17.0, Android 14]
- **App Version**: [e.g. 1.0.0]

### Development Environment

- **React Native Version**: [e.g. 0.74.0]
- **@gmemmy/react-native-biolink Version**: [e.g. 1.0.1]
- **react-native-nitro-modules Version**: [e.g. 0.26.0]
- **Node.js Version**: [e.g. 18.17.0]
- **Platform**: [e.g. iOS, Android, Both]

### Build Configuration

- **New Architecture**: [Yes/No]
- **Expo**: [Yes/No - if yes, specify version]
- **Development Build**: [Yes/No]

## 📋 Additional Context

### Code Example

```typescript
// Please provide a minimal code example that reproduces the issue
import { authenticate } from '@gmemmy/react-native-biolink';

try {
  const result = await authenticate(true);
  console.log('Result:', result);
} catch (error) {
  console.error('Error:', error);
}
```

### Error Messages

```
// Please paste any error messages, stack traces, or logs here
```

### Screenshots/Videos

If applicable, add screenshots or videos to help explain your problem.

## 🔍 Debugging Information

### Native Logs

**iOS**: Please check Xcode console for native logs
**Android**: Please check Android Studio Logcat for native logs

### Metro Logs

Please check Metro bundler console for any JavaScript errors.

## 📋 Checklist

- [ ] I have searched existing issues to avoid duplicates
- [ ] I have provided all required environment information
- [ ] I have included a minimal code example
- [ ] I have included error messages/logs
- [ ] I have tested on both iOS and Android (if applicable)
- [ ] I have tested with the latest version of the library

## 🔗 Related Issues

Link to any related issues or pull requests.

---

**Note**: Please be as detailed as possible. The more information you provide, the faster we can resolve the issue!
