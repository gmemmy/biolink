// Mock native module and logger before imports
jest.mock('react-native-nitro-modules', () => ({
  NitroModules: {
    createHybridObject: jest.fn(),
  },
}));

// Mock logger to silence logs in tests
jest.mock('../src/logger', () => ({
  getLogger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

import {
  signInWithBiometrics,
  authenticate,
  __setCoreForTesting,
} from '../src/index';
import type { BiolinkCore } from '../specs/BiolinkCore.nitro';

describe('BioLink Authentication', () => {
  let mockCore: BiolinkCore;

  beforeEach(() => {
    // Reset core singleton between tests
    __setCoreForTesting(null);

    // Create fresh mock for each test
    mockCore = {
      authenticate: jest.fn(),
      storeSecret: jest.fn(),
      getSecret: jest.fn(),
      name: 'MockBiolinkCore',
      equals: jest.fn(),
      dispose: jest.fn(),
    } as BiolinkCore;
  });

  describe('signInWithBiometrics', () => {
    it('returns true when native authenticate resolves true (no fallback)', async () => {
      (mockCore.authenticate as jest.Mock).mockResolvedValue(true);
      __setCoreForTesting(mockCore);

      const result = await signInWithBiometrics();

      expect(result).toBe(true);
      expect(mockCore.authenticate).toHaveBeenCalledWith(false);
    });

    it('returns true when native authenticate resolves true (with fallback)', async () => {
      (mockCore.authenticate as jest.Mock).mockResolvedValue(true);
      __setCoreForTesting(mockCore);

      const result = await signInWithBiometrics(true);

      expect(result).toBe(true);
      expect(mockCore.authenticate).toHaveBeenCalledWith(true);
    });

    it('defaults to false when no fallback parameter provided', async () => {
      (mockCore.authenticate as jest.Mock).mockResolvedValue(true);
      __setCoreForTesting(mockCore);

      await signInWithBiometrics();

      expect(mockCore.authenticate).toHaveBeenCalledWith(false);
    });

    it('propagates rejection when native authenticate rejects', async () => {
      const error = new Error('Authentication failed');
      (mockCore.authenticate as jest.Mock).mockRejectedValue(error);
      __setCoreForTesting(mockCore);

      await expect(signInWithBiometrics()).rejects.toThrow(
        'Authentication failed'
      );
      expect(mockCore.authenticate).toHaveBeenCalledWith(false);
    });

    it('propagates rejection when native authenticate rejects with fallback', async () => {
      const error = new Error('Authentication failed');
      (mockCore.authenticate as jest.Mock).mockRejectedValue(error);
      __setCoreForTesting(mockCore);

      await expect(signInWithBiometrics(true)).rejects.toThrow(
        'Authentication failed'
      );
      expect(mockCore.authenticate).toHaveBeenCalledWith(true);
    });
  });

  describe('authenticate', () => {
    it('calls native authenticate with false when no parameter provided', async () => {
      (mockCore.authenticate as jest.Mock).mockResolvedValue(true);
      __setCoreForTesting(mockCore);

      const result = await authenticate();

      expect(result).toBe(true);
      expect(mockCore.authenticate).toHaveBeenCalledWith(false);
    });

    it('calls native authenticate with false when explicitly passed false', async () => {
      (mockCore.authenticate as jest.Mock).mockResolvedValue(true);
      __setCoreForTesting(mockCore);

      const result = await authenticate(false);

      expect(result).toBe(true);
      expect(mockCore.authenticate).toHaveBeenCalledWith(false);
    });

    it('calls native authenticate with true when explicitly passed true', async () => {
      (mockCore.authenticate as jest.Mock).mockResolvedValue(true);
      __setCoreForTesting(mockCore);

      const result = await authenticate(true);

      expect(result).toBe(true);
      expect(mockCore.authenticate).toHaveBeenCalledWith(true);
    });

    it('returns false when native authenticate resolves false', async () => {
      (mockCore.authenticate as jest.Mock).mockResolvedValue(false);
      __setCoreForTesting(mockCore);

      const result = await authenticate(false);

      expect(result).toBe(false);
      expect(mockCore.authenticate).toHaveBeenCalledWith(false);
    });

    it('propagates rejection when native authenticate rejects', async () => {
      const error = new Error('Biometric hardware not available');
      (mockCore.authenticate as jest.Mock).mockRejectedValue(error);
      __setCoreForTesting(mockCore);

      await expect(authenticate(true)).rejects.toThrow(
        'Biometric hardware not available'
      );
      expect(mockCore.authenticate).toHaveBeenCalledWith(true);
    });
  });

  describe('authenticate vs signInWithBiometrics equivalence', () => {
    it('authenticate() and signInWithBiometrics() produce identical results', async () => {
      (mockCore.authenticate as jest.Mock).mockResolvedValue(true);
      __setCoreForTesting(mockCore);

      const authenticateResult = await authenticate();

      (mockCore.authenticate as jest.Mock).mockClear();

      const signInResult = await signInWithBiometrics();

      expect(authenticateResult).toBe(signInResult);
      expect(mockCore.authenticate).toHaveBeenCalledWith(false);
    });

    it('authenticate(true) and signInWithBiometrics(true) produce identical results', async () => {
      (mockCore.authenticate as jest.Mock).mockResolvedValue(true);
      __setCoreForTesting(mockCore);

      const authenticateResult = await authenticate(true);

      (mockCore.authenticate as jest.Mock).mockClear();

      const signInResult = await signInWithBiometrics(true);

      expect(authenticateResult).toBe(signInResult);
      expect(mockCore.authenticate).toHaveBeenCalledWith(true);
    });
  });
});
