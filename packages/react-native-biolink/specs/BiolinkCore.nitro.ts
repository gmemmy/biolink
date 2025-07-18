import type { HybridObject } from 'react-native-nitro-modules';

export interface BiolinkCore
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  /** Prompt OS fingerprint/FaceID and resolve true on success. Falls back to device credential if `fallbackToDeviceCredential` is true. */
  authenticate(fallbackToDeviceCredential?: boolean): Promise<boolean>;

  /** Store the given secret under `key`; rejects on error */
  storeSecret(key: string, value: string): Promise<void>;

  /** Retrieve the secret for `key`; resolves `undefined` if missing */
  getSecret(key: string): Promise<string | undefined>;

  /** Sign a challenge string using the device's secure key. Returns the signature as a base64 string. */
  signChallenge(challenge: string): Promise<string>;

  /** Get the public key associated with the device's secure key. Returns the public key as a base64 string. */
  getPublicKey(): Promise<string>;
}
