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

import { signInWithBiometrics, __setCoreForTesting } from '../src/index';
import type { BiolinkCore } from '../specs/BiolinkCore.nitro';

describe('signInWithBiometrics', () => {
  beforeEach(() => {
    // Reset core singleton between tests
    __setCoreForTesting(null);
  });

  it('returns true when native authenticate resolves true', async () => {
    const fakeCore = {
      authenticate: jest.fn().mockResolvedValue(true),
      storeSecret: jest.fn(),
      getSecret: jest.fn(),
      name: 'MockBiolinkCore',
      equals: jest.fn(),
      dispose: jest.fn(),
    } as BiolinkCore;
    __setCoreForTesting(fakeCore);
    await expect(signInWithBiometrics()).resolves.toBe(true);
  });

  it('propagates rejection when native authenticate rejects', async () => {
    const error = new Error('fail');
    const fakeCore = {
      authenticate: jest.fn().mockRejectedValue(error),
      storeSecret: jest.fn(),
      getSecret: jest.fn(),
      name: 'MockBiolinkCore',
      equals: jest.fn(),
      dispose: jest.fn(),
    } as BiolinkCore;
    __setCoreForTesting(fakeCore);
    await expect(signInWithBiometrics()).rejects.toThrow('fail');
  });
});
