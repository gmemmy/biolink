const fs = require('fs');
const path = require('path');

describe('README.md Link Validation Tests', () => {
  let readmeContent;
  const projectRoot = process.cwd();

  beforeAll(() => {
    const readmePath = path.join(projectRoot, 'README.md');
    readmeContent = fs.readFileSync(readmePath, 'utf8');
  });

  describe('Internal File References', () => {
    test('should reference existing local files', () => {
      const relativeLinks = [
        { path: './packages/react-native-biolink/README.md', required: true },
        { path: './biolink-demo/README.md', required: true },
        { path: './LICENSE', required: true }
      ];

      relativeLinks.forEach(({ path: linkPath, required }) => {
        const fullPath = path.resolve(projectRoot, linkPath);
        const linkRegex = new RegExp(linkPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        
        if (readmeContent.match(linkRegex)) {
          if (required) {
            expect(fs.existsSync(fullPath)).toBe(true);
          } else if (!fs.existsSync(fullPath)) {
            console.warn(`Referenced file ${linkPath} does not exist yet`);
          }
        }
      });
    });

    test('should reference valid project structure paths', () => {
      const structurePaths = [
        'packages/react-native-biolink',
        'biolink-demo'
      ];

      structurePaths.forEach(dirPath => {
        if (readmeContent.includes(dirPath)) {
          const fullPath = path.join(projectRoot, dirPath);
          expect(fs.existsSync(fullPath)).toBe(true);
        }
      });
    });
  });

  describe('URL Format Validation', () => {
    test('should have properly formatted URLs', () => {
      const urlRegex = /https?:\/\/[^\s\)]+/g;
      const urls = readmeContent.match(urlRegex) || [];

      expect(urls.length).toBeGreaterThan(0);

      urls.forEach(url => {
        expect(url).toMatch(/^https?:\/\/.+/);
        expect(url).not.toMatch(/\s/);
        expect(url).not.toMatch(/[<>]/);
      });
    });

    test('should use HTTPS for external links where possible', () => {
      const httpUrls = readmeContent.match(/http:\/\/[^\s\)]+/g) || [];
      
      httpUrls.forEach(url => {
        if (!url.includes('localhost')) {
          console.warn(`Consider using HTTPS for: ${url}`);
        }
      });
    });

    test('should have valid GitHub repository URLs', () => {
      const githubUrls = readmeContent.match(/https:\/\/github\.com\/gmemmy\/biolink[^\s\)]*/g) || [];
      expect(githubUrls.length).toBeGreaterThan(0);
      
      githubUrls.forEach(url => {
        expect(url).toMatch(/^https:\/\/github\.com\/gmemmy\/biolink/);
      });
    });

    test('should have valid npm registry URLs', () => {
      const npmUrls = readmeContent.match(/https:\/\/[^\/]*npmjs\.com[^\s\)]*/g) || [];
      if (npmUrls.length > 0) {
        npmUrls.forEach(url => {
          expect(url).toMatch(/npmjs\.com/);
        });
      }
    });
  });

  describe('Link Anchor Consistency', () => {
    test('should have consistent badge link formats', () => {
      const ciBadgeRegex = /\[\!\[CI\]\(([^)]+)\)\]\(([^)]+)\)/;
      const ciMatch = readmeContent.match(ciBadgeRegex);
      
      if (ciMatch) {
        const [, badgeUrl, linkUrl] = ciMatch;
        expect(badgeUrl).toMatch(/github\.com.*badge\.svg/);
        expect(linkUrl).toMatch(/github\.com.*actions/);
      }

      const npmBadgeRegex = /\[\!\[npm version\]\(([^)]+)\)\]\(([^)]+)\)/;
      const npmMatch = readmeContent.match(npmBadgeRegex);
      
      if (npmMatch) {
        const [, badgeUrl, linkUrl] = npmMatch;
        expect(badgeUrl).toMatch(/badge\.fury\.io/);
        expect(linkUrl).toMatch(/badge\.fury\.io/);
      }

      const licenseBadgeRegex = /\[\!\[License\]\(([^)]+)\)\]\(([^)]+)\)/;
      const licenseMatch = readmeContent.match(licenseBadgeRegex);
      
      if (licenseMatch) {
        const [, badgeUrl, linkUrl] = licenseMatch;
        expect(badgeUrl).toMatch(/img\.shields\.io/);
        expect(linkUrl).toContain('LICENSE');
      }
    });
  });

  describe('Markdown Link Syntax', () => {
    test('should use proper markdown link syntax', () => {
      const malformedLinks = [
        /\[([^\]]+)\]\s+\(/,
        /\[([^\]]*)\]\(\s*\)/,
        /\]\([^)]*\s[^)]*\)(?!\s*$)/
      ];

      malformedLinks.forEach(pattern => {
        const matches = readmeContent.match(pattern);
        expect(matches).toBe(null);
      });
    });

    test('should have balanced markdown link brackets', () => {
      const openBrackets = (readmeContent.match(/\[/g) || []).length;
      const closeBrackets = (readmeContent.match(/\]/g) || []).length;
      
      expect(openBrackets).toBe(closeBrackets);
    });

    test('should have balanced parentheses in links', () => {
      const linkOpenParens = (readmeContent.match(/\]\(/g) || []).length;
      const linkCloseParens = (readmeContent.match(/\)/g) || []).length;
      
      // Should have roughly equal numbers (allowing for other parentheses)
      expect(linkCloseParens).toBeGreaterThanOrEqual(linkOpenParens);
    });

    test('should not have nested markdown links', () => {
      const nestedLinkPattern = /\[[^\]]*\[[^\]]*\]/;
      expect(readmeContent).not.toMatch(nestedLinkPattern);
    });
  });

  describe('External Service Integrations', () => {
    test('should reference correct badge services', () => {
      const badgeServices = [
        'github.com',
        'badge.fury.io', 
        'img.shields.io'
      ];

      badgeServices.forEach(service => {
        expect(readmeContent).toMatch(new RegExp(service));
      });
    });

    test('should have proper npm package URL encoding', () => {
      const encodedPackageName = '%40gmemmy%2Freact-native-biolink';
      expect(readmeContent).toContain(encodedPackageName);
    });
  });
});