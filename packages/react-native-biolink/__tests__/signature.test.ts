import {
  getSignatureHeaders,
  getSignatureHeadersWithPublicKey,
  isSigningAvailable,
  SIGNATURE_CONFIG,
  __resetSignatureCache,
  __setCoreForTesting,
} from '../src/utils/signature';
import type { BiolinkCore } from '../specs/BiolinkCore.nitro';

jest.mock('react-native-nitro-modules', () => ({
  NitroModules: {
    createHybridObject: jest.fn(),
  },
}));

describe('Signature Utilities', () => {
  let mockCore: BiolinkCore;
  const mockNitroModules = jest.requireMock('react-native-nitro-modules');

  beforeEach(() => {
    __setCoreForTesting(null);
    __resetSignatureCache();

    mockCore = {
      authenticate: jest.fn(),
      storeSecret: jest.fn(),
      getSecret: jest.fn(),
      signChallenge: jest.fn(),
      getPublicKey: jest.fn(),
      name: 'MockBiolinkCore',
      equals: jest.fn(),
      dispose: jest.fn(),
    } as BiolinkCore;

    mockNitroModules.NitroModules.createHybridObject.mockReturnValue(mockCore);
  });

  describe('getSignatureHeaders', () => {
    it('generates signature headers for string body', async () => {
      const mockSignature = 'base64-signature-here';
      (mockCore.signChallenge as jest.Mock).mockResolvedValue(mockSignature);
      __setCoreForTesting(mockCore);

      const body = 'test-payload';
      const headers = await getSignatureHeaders(body);

      expect(headers).toEqual({
        [SIGNATURE_CONFIG.BODY_SIGNATURE_HEADER]: mockSignature,
      });
      expect(mockCore.signChallenge).toHaveBeenCalledWith(body);
    });

    it('generates signature headers for object body', async () => {
      const mockSignature = 'base64-signature-here';
      (mockCore.signChallenge as jest.Mock).mockResolvedValue(mockSignature);
      __setCoreForTesting(mockCore);

      const body = { userId: 123, action: 'login' };
      const headers = await getSignatureHeaders(body);

      expect(headers).toEqual({
        [SIGNATURE_CONFIG.BODY_SIGNATURE_HEADER]: mockSignature,
      });
      expect(mockCore.signChallenge).toHaveBeenCalledWith(JSON.stringify(body));
    });

    it('uses custom header name when provided', async () => {
      const mockSignature = 'base64-signature-here';
      (mockCore.signChallenge as jest.Mock).mockResolvedValue(mockSignature);
      __setCoreForTesting(mockCore);

      const body = 'test-payload';
      const customHeader = 'X-Custom-Signature';
      const headers = await getSignatureHeaders(body, customHeader);

      expect(headers).toEqual({
        [customHeader]: mockSignature,
      });
    });

    it('propagates signing errors', async () => {
      const error = new Error('Signing failed');
      (mockCore.signChallenge as jest.Mock).mockRejectedValue(error);
      __setCoreForTesting(mockCore);

      await expect(getSignatureHeaders('test')).rejects.toThrow(
        'Signature generation failed: Signing failed'
      );
    });
  });

  describe('getSignatureHeadersWithPublicKey', () => {
    it('includes both signature and public key headers', async () => {
      const mockSignature = 'base64-signature-here';
      const mockPublicKey = 'base64-public-key-here';
      (mockCore.signChallenge as jest.Mock).mockResolvedValue(mockSignature);
      (mockCore.getPublicKey as jest.Mock).mockResolvedValue(mockPublicKey);
      __setCoreForTesting(mockCore);

      const body = { userId: 123 };
      const headers = await getSignatureHeadersWithPublicKey(body);

      expect(headers).toEqual({
        [SIGNATURE_CONFIG.BODY_SIGNATURE_HEADER]: mockSignature,
        [SIGNATURE_CONFIG.PUBLIC_KEY_HEADER]: mockPublicKey,
      });
    });

    it('excludes public key when includePublicKey is false', async () => {
      const mockSignature = 'base64-signature-here';
      (mockCore.signChallenge as jest.Mock).mockResolvedValue(mockSignature);
      __setCoreForTesting(mockCore);

      const body = { userId: 123 };
      const headers = await getSignatureHeadersWithPublicKey(body, false);

      expect(headers).toEqual({
        [SIGNATURE_CONFIG.BODY_SIGNATURE_HEADER]: mockSignature,
      });
      expect(mockCore.getPublicKey).not.toHaveBeenCalled();
    });

    it('propagates public key errors', async () => {
      const mockSignature = 'base64-signature-here';
      const error = new Error('Public key failed');
      (mockCore.signChallenge as jest.Mock).mockResolvedValue(mockSignature);
      (mockCore.getPublicKey as jest.Mock).mockRejectedValue(error);
      __setCoreForTesting(mockCore);

      await expect(getSignatureHeadersWithPublicKey('test')).rejects.toThrow(
        'Signature generation with public key failed: Public key failed'
      );
    });
  });

  describe('isSigningAvailable', () => {
    it('returns true when signing is available', async () => {
      (mockCore.getPublicKey as jest.Mock).mockResolvedValue('public-key');
      __setCoreForTesting(mockCore);

      const available = await isSigningAvailable();

      expect(available).toBe(true);
      expect(mockCore.getPublicKey).toHaveBeenCalled();
    });

    it('returns false when signing is not available', async () => {
      const error = new Error('Signing not available');
      (mockCore.getPublicKey as jest.Mock).mockRejectedValue(error);
      __setCoreForTesting(mockCore);

      const available = await isSigningAvailable();

      expect(available).toBe(false);
    });
  });

  describe('SIGNATURE_CONFIG', () => {
    it('exports correct header names', () => {
      expect(SIGNATURE_CONFIG.BODY_SIGNATURE_HEADER).toBe('X-Body-Signature');
      expect(SIGNATURE_CONFIG.PUBLIC_KEY_HEADER).toBe('X-Public-Key');
    });
  });
});
