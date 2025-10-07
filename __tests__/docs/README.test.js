const fs = require('fs');
const path = require('path');

describe('README.md Documentation Tests', () => {
  let readmeContent;

  beforeAll(() => {
    const readmePath = path.join(process.cwd(), 'README.md');
    readmeContent = fs.readFileSync(readmePath, 'utf8');
  });

  describe('Structure and Format', () => {
    test('should have a proper title', () => {
      expect(readmeContent).toMatch(/^#\s+React Native Biolink/m);
    });

    test('should contain all required badges', () => {
      expect(readmeContent).toMatch(/\[\!\[CI\]/);
      expect(readmeContent).toMatch(/\[\!\[npm version\]/);
      expect(readmeContent).toMatch(/\[\!\[License\]/);
    });

    test('should have all main sections', () => {
      const requiredSections = [
        'NPM Package',
        'Current Features',
        'Coming Soon', 
        'Requirements',
        'Documentation',
        'License'
      ];
      
      requiredSections.forEach(section => {
        expect(readmeContent).toMatch(new RegExp(`##\\s+${section}`, 'm'));
      });
    });

    test('should have proper heading hierarchy', () => {
      const lines = readmeContent.split('\n');
      let hasH1 = false;
      let hasH2AfterH1 = false;
      
      lines.forEach(line => {
        if (line.match(/^#\s+/)) {
          hasH1 = true;
        } else if (line.match(/^##\s+/) && hasH1) {
          hasH2AfterH1 = true;
        }
      });
      
      expect(hasH1).toBe(true);
      expect(hasH2AfterH1).toBe(true);
    });
  });

  describe('Package Information', () => {
    test('should reference correct npm package name', () => {
      const packageMatches = readmeContent.match(/@gmemmy\/react-native-biolink/g);
      expect(packageMatches).toBeTruthy();
      expect(packageMatches.length).toBeGreaterThan(2);
    });

    test('should include installation commands for all package managers', () => {
      expect(readmeContent).toMatch(/npm install @gmemmy\/react-native-biolink/);
      expect(readmeContent).toMatch(/pnpm add @gmemmy\/react-native-biolink/);
      expect(readmeContent).toMatch(/yarn add @gmemmy\/react-native-biolink/);
    });

    test('should mention required companion package', () => {
      expect(readmeContent).toMatch(/react-native-nitro-modules/);
    });

    test('should include both packages in installation commands', () => {
      expect(readmeContent).toMatch(/@gmemmy\/react-native-biolink react-native-nitro-modules/);
    });
  });

  describe('Technical Requirements', () => {
    test('should specify React Native version requirement', () => {
      expect(readmeContent).toMatch(/React Native.*≥\s*0\.74/);
    });

    test('should specify iOS version requirement', () => {
      expect(readmeContent).toMatch(/iOS.*13\+/);
    });

    test('should specify Android API requirement', () => {
      expect(readmeContent).toMatch(/Android.*API\s*23\+/);
    });

    test('should mention New Architecture requirement', () => {
      expect(readmeContent).toMatch(/New Architecture/);
    });

    test('should mention hardware security features', () => {
      expect(readmeContent).toMatch(/Secure Enclave/);
      expect(readmeContent).toMatch(/TEE Keystore/);
    });
  });

  describe('Features Documentation', () => {
    test('should list all current features with descriptions', () => {
      const currentFeatures = [
        'Bridge-Free',
        'Hardware-Backed Security', 
        'Biometric Authentication',
        'Secure Storage',
        'PIN Authentication',
        'Digital Signing',
        'Cross-Platform',
        'React Hooks'
      ];
      
      currentFeatures.forEach(feature => {
        expect(readmeContent).toMatch(new RegExp(`\\*\\*${feature}\\*\\*`, 'i'));
      });
    });

    test('should list coming soon features', () => {
      const comingSoonFeatures = [
        'FIDO2/WebAuthn Passkeys',
        'Analytics & Observability', 
        'Expo Config Plugin'
      ];
      
      comingSoonFeatures.forEach(feature => {
        expect(readmeContent).toMatch(new RegExp(`\\*\\*${feature}\\*\\*`, 'i'));
      });
    });

    test('should have v1.0 version reference for current features', () => {
      expect(readmeContent).toMatch(/Current Features.*\(v1\.0\)/s);
    });

    test('should describe key technical benefits', () => {
      expect(readmeContent).toMatch(/near-zero latency/i);
      expect(readmeContent).toMatch(/JSI/);
      expect(readmeContent).toMatch(/Nitro/);
    });
  });

  describe('Links and References', () => {
    test('should contain valid relative links to documentation', () => {
      const relativeLinks = [
        './packages/react-native-biolink/README.md',
        './biolink-demo/README.md', 
        './LICENSE'
      ];
      
      relativeLinks.forEach(link => {
        expect(readmeContent).toMatch(new RegExp(link.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
      });
    });

    test('should contain valid GitHub repository links', () => {
      const githubLinks = [
        'https://github.com/gmemmy/biolink/issues',
        'https://github.com/gmemmy/biolink/discussions',
        'https://github.com/gmemmy/biolink/blob/main/CONTRIBUTING.md'
      ];
      
      githubLinks.forEach(link => {
        expect(readmeContent).toContain(link);
      });
    });

    test('should contain valid npm package link', () => {
      expect(readmeContent).toMatch(/https:\/\/www\.npmjs\.com\/package\/@gmemmy\/react-native-biolink/);
    });

    test('should contain valid Nitro Modules link', () => {
      expect(readmeContent).toMatch(/https:\/\/nitro\.margelo\.com/);
    });

    test('should have descriptive documentation link emojis', () => {
      expect(readmeContent).toMatch(/📖.*Package API Reference/);
      expect(readmeContent).toMatch(/📱.*Demo App/);
      expect(readmeContent).toMatch(/🐛.*Issues/);
      expect(readmeContent).toMatch(/💬.*Discussions/);
      expect(readmeContent).toMatch(/📋.*Contributing Guide/);
    });
  });

  describe('Badge Validation', () => {
    test('CI badge should point to correct GitHub Actions', () => {
      expect(readmeContent).toMatch(/https:\/\/github\.com\/gmemmy\/biolink\/workflows\/CI\/badge\.svg/);
      expect(readmeContent).toMatch(/https:\/\/github\.com\/gmemmy\/biolink\/actions/);
    });

    test('npm badge should point to correct package', () => {
      expect(readmeContent).toMatch(/https:\/\/badge\.fury\.io\/js\/%40gmemmy%2Freact-native-biolink\.svg/);
      expect(readmeContent).toMatch(/https:\/\/badge\.fury\.io\/js\/%40gmemmy%2Freact-native-biolink/);
    });

    test('license badge should be properly formatted', () => {
      expect(readmeContent).toMatch(/https:\/\/img\.shields\.io\/badge\/License-MIT-green\?style=flat/);
      expect(readmeContent).toContain('LICENSE');
    });

    test('badges should have proper markdown link syntax', () => {
      const badgeRegex = /\[\!\[[^\]]+\]\([^)]+\)\]\([^)]+\)/g;
      const badges = readmeContent.match(badgeRegex);
      expect(badges).toBeTruthy();
      expect(badges.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Content Quality', () => {
    test('should not contain placeholder text', () => {
      const placeholders = ['TODO', 'FIXME', 'XXX', 'TBD', 'PLACEHOLDER'];
      placeholders.forEach(placeholder => {
        expect(readmeContent.toUpperCase()).not.toContain(placeholder);
      });
    });

    test('should have proper markdown formatting for code blocks', () => {
      const codeBlockRegex = /```[\s\S]*?```/g;
      const matches = readmeContent.match(codeBlockRegex);
      
      expect(matches).toBeTruthy();
      expect(matches.length).toBeGreaterThan(0);
      
      // Check that bash code block is properly formatted
      expect(readmeContent).toMatch(/```bash/);
    });

    test('should use consistent list formatting', () => {
      const listItems = readmeContent.match(/^-\s+/gm);
      expect(listItems).toBeTruthy();
      expect(listItems.length).toBeGreaterThan(0);
      
      // All bullet points should start with dash and space
      listItems.forEach(bullet => {
        expect(bullet).toBe('- ');
      });
    });

    test('should not have trailing whitespace', () => {
      const lines = readmeContent.split('\n');
      lines.forEach((line, index) => {
        expect(line).not.toMatch(/\s+$/);
      });
    });

    test('should end with newline', () => {
      expect(readmeContent).toMatch(/\n$/);
    });
  });

  describe('Version and Package Consistency', () => {
    test('should have consistent package naming throughout', () => {
      const packageNameMatches = readmeContent.match(/@gmemmy\/react-native-biolink/g);
      expect(packageNameMatches.length).toBeGreaterThan(2);
      
      // Check that all instances use the same format
      packageNameMatches.forEach(name => {
        expect(name).toBe('@gmemmy/react-native-biolink');
      });
    });

    test('should not have conflicting package names', () => {
      const conflictingPatterns = [
        /@gmemmy\/react-native-bio-link/,
        /@gmemmy\/reactnative-biolink/,
        /@gmemmy\/react_native_biolink/
      ];

      conflictingPatterns.forEach(pattern => {
        expect(readmeContent).not.toMatch(pattern);
      });
    });

    test('should have consistent React Native version requirements', () => {
      const rnVersionMatches = readmeContent.match(/React Native[^\d]*([0-9.]+)/gi) || [];
      
      if (rnVersionMatches.length > 1) {
        const versions = rnVersionMatches.map(match => match.match(/([0-9.]+)/)[1]);
        const uniqueVersions = [...new Set(versions)];
        expect(uniqueVersions.length).toBe(1);
      }
    });
  });
});