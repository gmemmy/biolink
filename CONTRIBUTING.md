# Contributing to React Native Biolink

Thank you for your interest in contributing to React Native Biolink! This document provides guidelines and information for contributors.

## 🚀 Quick Start

1. **Fork** the repository
2. **Clone** your fork locally
3. **Install** dependencies: `pnpm install`
4. **Build** the library: `pnpm build`
5. **Test** your changes: `pnpm test`
6. **Submit** a pull request

## 📋 Issue Templates

We provide several issue templates to help you report problems and request features:

- **🐛 Bug Report** - For reporting bugs and issues
- **💡 Feature Request** - For suggesting new features
- **❓ Question/Help** - For asking questions and getting help
- **🔒 Security Vulnerability** - For reporting security issues

Please use the appropriate template when creating issues.

## 🛠️ Development Setup

### Prerequisites

- Node.js >= 18.0.0
- pnpm package manager
- React Native development environment
- iOS/Android development tools

### Local Development

```bash
# Clone the repository
git clone https://github.com/gmemmy/biolink.git
cd biolink

# Install dependencies
pnpm install

# Build the library
pnpm build

# Run tests
pnpm test

# Run linting
pnpm lint:check

# Format code
pnpm format
```

### Working with the Demo App

```bash
# Navigate to demo app
cd biolink-demo

# Install dependencies
pnpm install

# Run on iOS
npx react-native run-ios

# Run on Android
npx react-native run-android
```

## 📝 Code Style

### TypeScript

- Use TypeScript for all new code
- Prefer types over interfaces (unless functionality requires it)
- Use strict TypeScript configuration
- Add proper type annotations

### React Native

- Follow React Native best practices
- Use functional components with hooks
- Implement proper error boundaries
- Handle platform-specific code appropriately

### Testing

- Write unit tests for all new functionality
- Use Jest for testing
- Mock native modules appropriately
- Test both success and error scenarios

### Documentation

- Update README files when adding features
- Add JSDoc comments for public APIs
- Include usage examples
- Update API documentation

## 🔧 Pull Request Process

1. **Create a feature branch** from `main`
2. **Make your changes** following the code style guidelines
3. **Add tests** for new functionality
4. **Update documentation** as needed
5. **Run all checks** locally:
   ```bash
   pnpm run ci
   ```
6. **Submit a pull request** using our PR template
7. **Wait for review** and address feedback

### PR Checklist

- [ ] Code follows style guidelines
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] CI checks pass
- [ ] Manual testing completed

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage
```

### Test Structure

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test interactions between modules
- **Mock Tests**: Test native module interactions

### Writing Tests

```typescript
import { authenticate } from '@gmemmy/react-native-biolink';

describe('Authentication', () => {
  it('should authenticate successfully', async () => {
    // Test implementation
  });

  it('should handle authentication errors', async () => {
    // Error handling test
  });
});
```

## 🔒 Security

### Reporting Security Issues

If you discover a security vulnerability, please:

1. **Do not** create a public issue
2. **Email** us privately or use GitHub's private reporting
3. **Provide** detailed information about the vulnerability
4. **Wait** for our response before public disclosure

### Security Guidelines

- Never commit sensitive data (keys, tokens, etc.)
- Follow secure coding practices
- Validate all inputs
- Use proper error handling
- Test security features thoroughly

## 📚 Documentation

### Documentation Structure

- **README.md** - Project overview and quick start
- **packages/react-native-biolink/README.md** - Complete API documentation
- **biolink-demo/README.md** - Demo app documentation
- **CONTRIBUTING.md** - This file

### Writing Documentation

- Use clear, concise language
- Include code examples
- Provide step-by-step instructions
- Update when APIs change
- Include troubleshooting sections

## 🏷️ Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **Major** (X.0.0) - Breaking changes
- **Minor** (0.X.0) - New features, backward compatible
- **Patch** (0.0.X) - Bug fixes, backward compatible

### Release Checklist

- [ ] All tests passing
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version bumped
- [ ] Release notes prepared
- [ ] npm package published

## 🤝 Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Help others learn and grow
- Provide constructive feedback
- Follow project conventions
- Ask questions when unsure

### Communication

- Use GitHub Issues for bugs and features
- Use GitHub Discussions for questions
- Be clear and specific in your requests
- Provide context and examples
- Follow up on your contributions

## 🎯 Areas for Contribution

### High Priority

- **Bug fixes** - Especially security-related
- **Performance improvements** - Native module optimization
- **Documentation** - API docs, examples, guides
- **Testing** - Test coverage, E2E tests

### Medium Priority

- **New features** - Aligned with roadmap
- **Developer experience** - DX improvements
- **Platform support** - iOS/Android enhancements
- **Examples** - Additional usage examples

### Low Priority

- **Code refactoring** - Code quality improvements
- **Tooling** - Development tools and scripts
- **Examples** - Additional demo apps

## 📞 Getting Help

- **Documentation**: Check our README files
- **Issues**: Search existing issues
- **Discussions**: Ask questions in discussions
- **Email**: Contact us directly for urgent matters

## 🙏 Recognition

Contributors will be recognized in:

- **README.md** - Contributors section
- **Release notes** - For significant contributions
- **GitHub** - Contributor profile

Thank you for contributing to React Native Biolink! 🎉
