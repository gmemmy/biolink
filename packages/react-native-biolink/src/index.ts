import { useState, useCallback } from 'react';
import { NitroModules } from 'react-native-nitro-modules';
import type { BiolinkCore } from '../specs/BiolinkCore.nitro';
import { getLogger } from './logger';

export interface PinLockoutStatus {
  isLocked: boolean;
  remainingAttempts: number;
  lockoutEndsAt?: Date;
  totalAttempts: number;
}

export class PinAuthError extends Error {
  constructor(
    public code:
      | 'PIN_INCORRECT'
      | 'PIN_LOCKED'
      | 'PIN_NOT_ENROLLED'
      | 'PIN_INVALID',
    public remainingAttempts: number,
    public lockoutEndsAt?: Date,
    message?: string
  ) {
    super(message || code);
    this.name = 'PinAuthError';
  }
}

const PIN_CONFIG = {
  maxAttempts: 5,
  lockoutDuration: 5 * 60 * 1000,
  saltKey: 'app-pin-salt',
  hashKey: 'app-pin-hash',
  attemptsKey: 'app-pin-attempts',
  lastAttemptKey: 'app-pin-last-attempt',
  minLength: 4,
  maxLength: 8,
};

let _core: BiolinkCore | null = null;

function getCore(): BiolinkCore {
  if (!_core) {
    _core = NitroModules.get<BiolinkCore>('BiolinkCore');
  }
  return _core;
}

// For testing - inject mock core
export function __setCoreForTesting(mockCore: BiolinkCore | null) {
  _core = mockCore;
}

async function generateSalt(): Promise<string> {
  const array = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

async function hashPin(pin: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + salt);

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = new Uint8Array(hashBuffer);
    return Array.from(hashArray, byte =>
      byte.toString(16).padStart(2, '0')
    ).join('');
  }

  let hash = 0;
  const str = pin + salt;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

function validatePin(pin: string): boolean {
  return (
    typeof pin === 'string' &&
    pin.length >= PIN_CONFIG.minLength &&
    pin.length <= PIN_CONFIG.maxLength &&
    /^\d+$/.test(pin)
  );
}

/**
 * Sign in with biometrics using the native authentication
 * @param fallbackToDeviceCredential - Allow fallback to device passcode/PIN if biometrics fail
 * @returns Promise<boolean> - true if authentication successful, false otherwise
 */
export async function signInWithBiometrics(
  fallbackToDeviceCredential = false
): Promise<boolean> {
  const logger = getLogger();
  const core = getCore();

  const startTime =
    typeof performance !== 'undefined' ? performance.now() : Date.now();

  try {
    logger.debug(
      `Starting biometric authentication (fallbackToDeviceCredential: ${fallbackToDeviceCredential})`
    );
    const result = await core.authenticate(fallbackToDeviceCredential);

    // Calculate JS round-trip latency
    const endTime =
      typeof performance !== 'undefined' ? performance.now() : Date.now();
    const duration = endTime - startTime;

    logger.debug(`signInWithBiometrics() JS latency: ${duration.toFixed(2)}ms`);

    if (result) {
      logger.info('Biometric authentication successful');
    } else {
      logger.warn('Biometric authentication failed - returned false');
    }

    return result;
  } catch (error) {
    // Still measure timing on error for complete metrics
    const endTime =
      typeof performance !== 'undefined' ? performance.now() : Date.now();
    const duration = endTime - startTime;

    logger.debug(
      `signInWithBiometrics() JS latency (error): ${duration.toFixed(2)}ms`
    );

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    logger.error('Biometric authentication failed with error:', errorMessage);
    throw error;
  }
}

/**
 * Authenticate with biometrics, with optional fallback to device credentials
 * @param fallbackToDeviceCredential - Allow fallback to device passcode/PIN if biometrics fail
 * @returns Promise<boolean> - true if authentication successful, false otherwise
 */
export async function authenticate(
  fallbackToDeviceCredential = false
): Promise<boolean> {
  return signInWithBiometrics(fallbackToDeviceCredential);
}

/**
 * Store a secret securely using the native keychain/keystore
 * @param key - The key to store the secret under
 * @param value - The secret value to store
 * @returns Promise<void> - resolves on success, rejects on error
 */
export async function storeSecret(key: string, value: string): Promise<void> {
  const logger = getLogger();
  const core = getCore();

  try {
    logger.debug(`Storing secret for key: ${key}`);
    await core.storeSecret(key, value);
    logger.info(`Secret stored successfully for key: ${key}`);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Failed to store secret for key ${key}:`, errorMessage);
    throw error;
  }
}

/**
 * Retrieve a secret from the native keychain/keystore
 * @param key - The key to retrieve the secret for
 * @returns Promise<string | undefined> - The secret value or undefined if not found
 */
export async function getSecret(key: string): Promise<string | undefined> {
  const logger = getLogger();
  const core = getCore();

  try {
    logger.debug(`Retrieving secret for key: ${key}`);
    const result = await core.getSecret(key);

    if (result) {
      logger.info(`Secret retrieved successfully for key: ${key}`);
    } else {
      logger.debug(`No secret found for key: ${key}`);
    }

    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Failed to retrieve secret for key ${key}:`, errorMessage);
    throw error;
  }
}

/**
 * Get the current PIN lockout status
 *
 * @returns Promise<PinLockoutStatus> - Current lockout information
 *
 * @example
 * ```typescript
 * const status = await getPinLockoutStatus();
 * if (status.isLocked) {
 *   console.log(`Locked until: ${status.lockoutEndsAt}`);
 * } else {
 *   console.log(`${status.remainingAttempts} attempts remaining`);
 * }
 * ```
 */
export async function getPinLockoutStatus(): Promise<PinLockoutStatus> {
  const logger = getLogger();
  const core = getCore();

  try {
    const [attemptsStr, lastAttemptStr] = await Promise.all([
      core.getSecret(PIN_CONFIG.attemptsKey),
      core.getSecret(PIN_CONFIG.lastAttemptKey),
    ]);

    const attempts = attemptsStr ? Number.parseInt(attemptsStr, 10) : 0;
    const lastAttempt = lastAttemptStr ? new Date(lastAttemptStr) : null;

    const isLocked = attempts >= PIN_CONFIG.maxAttempts;
    const lockoutEndsAt =
      isLocked && lastAttempt
        ? new Date(lastAttempt.getTime() + PIN_CONFIG.lockoutDuration)
        : undefined;

    // Check if lockout has expired
    const now = new Date();
    const lockoutExpired = lockoutEndsAt && now >= lockoutEndsAt;

    return {
      isLocked: isLocked && !lockoutExpired,
      remainingAttempts: Math.max(0, PIN_CONFIG.maxAttempts - attempts),
      lockoutEndsAt: lockoutExpired ? undefined : lockoutEndsAt,
      totalAttempts: attempts,
    };
  } catch (error) {
    logger.error('Failed to get PIN lockout status:', error);
    return {
      isLocked: false,
      remainingAttempts: PIN_CONFIG.maxAttempts,
      totalAttempts: 0,
    };
  }
}

/**
 * Clear PIN lockout status (admin function)
 *
 * @returns Promise<void> - resolves when lockout is cleared
 *
 * @example
 * ```typescript
 * await clearPinLockout();
 * console.log('PIN lockout cleared');
 * ```
 */
export async function clearPinLockout(): Promise<void> {
  const logger = getLogger();
  const core = getCore();

  try {
    await Promise.all([
      core.storeSecret(PIN_CONFIG.attemptsKey, '0'),
      core.storeSecret(PIN_CONFIG.lastAttemptKey, ''),
    ]);
    logger.info('PIN lockout cleared');
  } catch (error) {
    logger.error('Failed to clear PIN lockout:', error);
    throw error;
  }
}

/**
 * Enroll a PIN for app-managed authentication
 *
 * Stores a salted hash of the PIN in secure storage. The PIN must be 4-8 digits.
 *
 * @param pin - The PIN to enroll (4-8 digits)
 * @returns Promise<void> - resolves on success, rejects on error
 * @throws PinAuthError with code 'PIN_INVALID' if PIN doesn't meet requirements
 *
 * @example
 * ```typescript
 * try {
 *   await enrollPin('1234');
 *   console.log('PIN enrolled successfully');
 * } catch (error) {
 *   if (error instanceof PinAuthError) {
 *     console.error('PIN enrollment failed:', error.code);
 *   }
 * }
 * ```
 */
export async function enrollPin(pin: string): Promise<void> {
  const logger = getLogger();
  const core = getCore();

  if (!validatePin(pin)) {
    throw new PinAuthError(
      'PIN_INVALID',
      0,
      undefined,
      `PIN must be ${PIN_CONFIG.minLength}-${PIN_CONFIG.maxLength} digits`
    );
  }

  try {
    logger.debug('Enrolling PIN');

    // Generate salt and hash the PIN
    const salt = await generateSalt();
    const hash = await hashPin(pin, salt);

    // Store salt and hash
    await Promise.all([
      core.storeSecret(PIN_CONFIG.saltKey, salt),
      core.storeSecret(PIN_CONFIG.hashKey, hash),
    ]);

    // Clear any existing lockout
    await clearPinLockout();

    logger.info('PIN enrolled successfully');
  } catch (error) {
    logger.error('Failed to enroll PIN:', error);
    throw error;
  }
}

/**
 * Authenticate using the enrolled PIN
 *
 * Verifies the PIN against the stored hash and tracks failed attempts.
 * After maxAttempts failures, the PIN is locked for a configurable duration.
 *
 * @param pin - The PIN to authenticate with
 * @returns Promise<void> - resolves on success, rejects on error
 * @throws PinAuthError with appropriate code and attempt information
 *
 * @example
 * ```typescript
 * try {
 *   await authenticateWithPin('1234');
 *   console.log('PIN authentication successful');
 * } catch (error) {
 *   if (error instanceof PinAuthError) {
 *     console.error(`${error.code}: ${error.remainingAttempts} attempts left`);
 *   }
 * }
 * ```
 */
export async function authenticateWithPin(pin: string): Promise<void> {
  const logger = getLogger();
  const core = getCore();

  if (!validatePin(pin)) {
    throw new PinAuthError(
      'PIN_INVALID',
      0,
      undefined,
      `PIN must be ${PIN_CONFIG.minLength}-${PIN_CONFIG.maxLength} digits`
    );
  }

  try {
    logger.debug('Authenticating with PIN');
    const lockoutStatus = await getPinLockoutStatus();

    if (lockoutStatus.isLocked) {
      throw new PinAuthError(
        'PIN_LOCKED',
        0,
        lockoutStatus.lockoutEndsAt,
        'PIN is locked due to too many failed attempts'
      );
    }

    const [salt, storedHash] = await Promise.all([
      core.getSecret(PIN_CONFIG.saltKey),
      core.getSecret(PIN_CONFIG.hashKey),
    ]);

    if (!salt || !storedHash) {
      throw new PinAuthError(
        'PIN_NOT_ENROLLED',
        0,
        undefined,
        'No PIN has been enrolled'
      );
    }

    const providedHash = await hashPin(pin, salt);

    if (providedHash === storedHash) {
      await clearPinLockout();
      logger.info('PIN authentication successful');
      return;
    }

    const newAttempts = lockoutStatus.totalAttempts + 1;
    await Promise.all([
      core.storeSecret(PIN_CONFIG.attemptsKey, newAttempts.toString()),
      core.storeSecret(PIN_CONFIG.lastAttemptKey, new Date().toISOString()),
    ]);

    const remainingAttempts = Math.max(0, PIN_CONFIG.maxAttempts - newAttempts);

    if (remainingAttempts === 0) {
      const lockoutEndsAt = new Date(Date.now() + PIN_CONFIG.lockoutDuration);
      throw new PinAuthError(
        'PIN_LOCKED',
        0,
        lockoutEndsAt,
        'PIN is locked due to too many failed attempts'
      );
    }

    throw new PinAuthError(
      'PIN_INCORRECT',
      remainingAttempts,
      undefined,
      `Incorrect PIN. ${remainingAttempts} attempts remaining`
    );
  } catch (error) {
    if (error instanceof PinAuthError) {
      logger.warn(`PIN authentication failed: ${error.code}`);
      throw error;
    }
    logger.error('PIN authentication error:', error);
    throw error;
  }
}

export type AuthState = {
  isAuthenticated: boolean;
  error: string | null;
  isLoading: boolean;
};

export type AuthActions = {
  authenticate: (fallbackToDeviceCredential?: boolean) => Promise<void>;
  clearError: () => void;
  reset: () => void;
};

export type UseAuthReturn = AuthState & AuthActions;

/**
 * React hook for managing biometric authentication state
 * @returns Object containing authentication state and actions
 */
export function useAuth(): UseAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const authenticate = useCallback(
    async (fallbackToDeviceCredential = false) => {
      const logger = getLogger();

      setIsLoading(true);
      setError(null);
      logger.debug('useAuth: Starting authentication');

      try {
        const success = await signInWithBiometrics(fallbackToDeviceCredential);
        if (success) {
          setIsAuthenticated(true);
          logger.info('useAuth: Authentication successful');
        } else {
          setError('Authentication failed');
          logger.warn('useAuth: Authentication failed');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Authentication failed';
        setError(errorMessage);
        setIsAuthenticated(false);
        logger.error('useAuth: Authentication error:', errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    const logger = getLogger();
    setError(null);
    logger.debug('useAuth: Error cleared');
  }, []);

  const reset = useCallback(() => {
    const logger = getLogger();
    setIsAuthenticated(false);
    setError(null);
    setIsLoading(false);
    logger.debug('useAuth: State reset');
  }, []);

  return {
    isAuthenticated,
    error,
    isLoading,
    authenticate,
    clearError,
    reset,
  };
}

export type { BiolinkCore } from '../specs/BiolinkCore.nitro';
export { getLogger, setLogger, resetLogger } from './logger';
export type { Logger } from './logger';
export {
  getSignatureHeaders,
  getSignatureHeadersWithPublicKey,
  isSigningAvailable,
  SIGNATURE_CONFIG,
} from './utils/signature';
