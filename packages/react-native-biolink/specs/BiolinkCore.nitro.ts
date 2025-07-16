import type { HybridObject } from 'react-native-nitro-modules';

export interface BiolinkCore
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  /** Prompt OS fingerprint/FaceID and resolve true on success. If `fallbackToDeviceCredential` is true, and biometric authentication fails, the device credential will be used. */
  authenticate(fallbackToDeviceCredential?: boolean): Promise<boolean>;

  /** Store the given secret under `key`; rejects on error */
  storeSecret(key: string, value: string): Promise<void>;

  /** Retrieve the secret for `key`; resolves `undefined` if missing */
  getSecret(key: string): Promise<string | undefined>;
}
