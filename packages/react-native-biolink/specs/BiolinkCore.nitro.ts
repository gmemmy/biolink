import type { HybridObject } from 'react-native-nitro-modules';

export type BiometryType = 'TouchID' | 'FaceID' | 'Biometrics' | 'None';

export interface SensorAvailability {
  available: boolean;
  biometryType: BiometryType;
}

export interface SimplePromptOptions {
  promptMessage?: string;
  cancelButtonText?: string;
}

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

  /** Check whether a biometric sensor is available and its type */
  isSensorAvailable(): Promise<SensorAvailability>;

  /** Returns true if a device biometric key-pair has been generated */
  biometricKeysExist(): Promise<boolean>;

  /** Delete the device biometric key-pair from the secure store */
  deleteKeys(): Promise<void>;

  /** Show a simple, non-crypto biometric prompt; resolves true on success */
  simplePrompt(options?: SimplePromptOptions): Promise<boolean>;
}
