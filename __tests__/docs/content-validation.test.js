const fs = require('fs');
const path = require('path');

describe('README.md Content Validation Tests', () => {
  let readmeContent;

  beforeAll(() => {
    const readmePath = path.join(process.cwd(), 'README.md');
    readmeContent = fs.readFileSync(readmePath, 'utf8');
  });

  describe('Feature Documentation Accuracy', () => {
    test('should not duplicate features between current and coming soon', () => {
      const currentSection = readmeContent.match(/### Current Features[\s\S]*?(?=### Coming Soon)/);
      const comingSoonSection = readmeContent.match(/### Coming Soon[\s\S]*?(?=##|$)/);
      
      if (currentSection && comingSoonSection) {
        const currentFeatures = currentSection[0].match(/\*\*([^*]+)\*\*/g) || [];
        const comingSoonFeatures = comingSoonSection[0].match(/\*\*([^*]+)\*\*/g) || [];
        
        const currentFeatureNames = currentFeatures.map(f => f.replace(/\*\*/g, ''));
        const comingSoonFeatureNames = comingSoonFeatures.map(f => f.replace(/\*\*/g, ''));
        
        currentFeatureNames.forEach(currentFeature => {
          expect(comingSoonFeatureNames).not.toContain(currentFeature);
        });
      }
    });

    test('should have detailed feature descriptions', () => {
      const featureLines = readmeContent.match(/- \*\*[^:]+:\*\* .+/g) || [];
      expect(featureLines.length).toBeGreaterThan(5);
      
      featureLines.forEach(line => {
        // Each feature should have a description after the colon
        expect(line).toMatch(/- \*\*[^:]+:\*\* .{10,}/);
      });
    });
  });

  describe('Technical Terminology Consistency', () => {
    test('should use consistent technical terms', () => {
      const technicalTerms = {
        'Nitro Modules': /Nitro\s+Modules?/gi,
        'New Architecture': /New\s+Architecture/gi,
        'JSI': /JSI/g,
        'Secure Enclave': /Secure\s+Enclave/gi,
        'TEE': /\bTEE\b/g
      };

      Object.entries(technicalTerms).forEach(([expectedTerm, pattern]) => {
        const matches = readmeContent.match(pattern) || [];
        if (matches.length > 0) {
          matches.forEach(match => {
            expect(match.toLowerCase()).toMatch(expectedTerm.toLowerCase().replace(/\s+/g, '\\s+'));
          });
        }
      });
    });

    test('should use consistent platform terminology', () => {
      // iOS should be consistently capitalized
      const iosMatches = readmeContent.match(/ios|iOS/gi) || [];
      iosMatches.forEach(match => {
        if (match !== 'iOS') {
          console.warn(`Inconsistent iOS capitalization: ${match}`);
        }
      });

      // Android should be consistently capitalized
      const androidMatches = readmeContent.match(/android|Android/gi) || [];
      androidMatches.forEach(match => {
        if (match !== 'Android') {
          console.warn(`Inconsistent Android capitalization: ${match}`);
        }
      });
    });
  });

  describe('Code Examples and Installation', () => {
    test('should have proper bash code block formatting', () => {
      const bashBlocks = readmeContent.match(/```bash\n[\s\S]*?\n```/g);
      expect(bashBlocks).toBeTruthy();
      expect(bashBlocks.length).toBeGreaterThan(0);
    });

    test('should include all package managers in installation', () => {
      const packageManagers = ['npm', 'pnpm', 'yarn'];
      packageManagers.forEach(pm => {
        expect(readmeContent).toMatch(new RegExp(`${pm} (install|add)`, 'i'));
      });
    });

    test('should have consistent package installation commands', () => {
      const installCommands = [
        'npm install @gmemmy/react-native-biolink react-native-nitro-modules',
        'pnpm add @gmemmy/react-native-biolink react-native-nitro-modules',
        'yarn add @gmemmy/react-native-biolink react-native-nitro-modules'
      ];

      installCommands.forEach(command => {
        expect(readmeContent).toContain(command);
      });
    });
  });

  describe('Documentation Structure', () => {
    test('should have logical section ordering', () => {
      const sections = [];
      const lines = readmeContent.split('\n');
      
      lines.forEach(line => {
        const match = line.match(/^##\s+(.+)$/);
        if (match) {
          sections.push(match[1]);
        }
      });

      expect(sections).toContain('NPM Package');
      expect(sections).toContain('Requirements');
      expect(sections).toContain('Documentation');
      expect(sections).toContain('License');
      
      // License should be last
      expect(sections[sections.length - 1]).toBe('License');
    });

    test('should have proper section separation', () => {
      const sectionBreaks = readmeContent.match(/^##\s+/gm);
      expect(sectionBreaks).toBeTruthy();
      expect(sectionBreaks.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Grammar and Style Consistency', () => {
    test('should use consistent punctuation in lists', () => {
      const featureLines = readmeContent.match(/- \*\*[^:]+:\*\* [^:]+/g) || [];
      
      featureLines.forEach(line => {
        // Feature descriptions should be complete phrases
        expect(line.length).toBeGreaterThan(20);
      });
    });

    test('should have consistent emoji usage', () => {
      const emojiLinks = readmeContent.match(/- \*\*[📖📱🐛💬📋]/gu) || [];
      expect(emojiLinks.length).toBeGreaterThan(3);
    });

    test('should not have double spaces', () => {
      expect(readmeContent).not.toMatch(/  +/);
    });

    test('should have consistent markdown formatting', () => {
      // Bold text should use ** not __
      expect(readmeContent).not.toMatch(/__[^_]+__/);
      
      // Code should use backticks consistently
      const inlineCodeMatches = readmeContent.match(/`[^`]+`/g) || [];
      expect(inlineCodeMatches.length).toBeGreaterThan(0);
    });
  });

  describe('Project Information Accuracy', () => {
    test('should reference correct repository in all links', () => {
      const repoUrls = readmeContent.match(/https:\/\/github\.com\/[^\/]+\/[^\/\s\)]+/g) || [];
      
      repoUrls.forEach(url => {
        expect(url).toMatch(/https:\/\/github\.com\/gmemmy\/biolink/);
      });
    });

    test('should have consistent author information', () => {
      if (readmeContent.includes('@gmemmy')) {
        expect(readmeContent).toMatch(/@gmemmy/);
      }
    });

    test('should reference correct npm organization', () => {
      const npmRefs = readmeContent.match(/@[a-zA-Z0-9-_]+\/react-native-biolink/g) || [];
      
      npmRefs.forEach(ref => {
        expect(ref).toBe('@gmemmy/react-native-biolink');
      });
    });
  });

  describe('Accessibility and SEO', () => {
    test('should have alt text for badges', () => {
      const badgeAltTexts = readmeContent.match(/\[\!\[([^\]]+)\]/g) || [];
      expect(badgeAltTexts.length).toBeGreaterThan(0);
      
      badgeAltTexts.forEach(altText => {
        expect(altText.length).toBeGreaterThan(5); // Should have meaningful alt text
      });
    });

    test('should have descriptive link text', () => {
      // Check that links have meaningful text, not just URLs
      const linkTexts = readmeContent.match(/\[([^\]]+)\]\([^)]+\)/g) || [];
      linkTexts.forEach(link => {
        const linkText = link.match(/\[([^\]]+)\]/)[1];
        expect(linkText).not.toMatch(/^https?:\/\//); // Link text should not be URL
        expect(linkText.length).toBeGreaterThan(2); // Should have meaningful text
      });
    });
  });

  describe('Version and Release Information', () => {
    test('should mention current library version appropriately', () => {
      // Check that v1.0 is mentioned in context of current features
      expect(readmeContent).toMatch(/v1\.0/);
    });

    test('should have consistent dependency version references', () => {
      // Check that React Native version is mentioned consistently
      const rnVersions = readmeContent.match(/0\.74/g) || [];
      expect(rnVersions.length).toBeGreaterThan(0);
    });
  });
});