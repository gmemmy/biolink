import { useState, useCallback } from 'react';
import { NitroModules } from 'react-native-nitro-modules';
import type { BiolinkCore } from '../specs/BiolinkCore.nitro';
import { getLogger } from './logger';

let _core: BiolinkCore | null = null;

function getCore(): BiolinkCore {
  if (!_core) {
    _core = NitroModules.createHybridObject<BiolinkCore>('BiolinkCore');
  }
  return _core;
}

// For testing - inject mock core
export function __setCoreForTesting(mockCore: BiolinkCore | null) {
  _core = mockCore;
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

  // Hybrid performance timing - should use performance API if available, else fallback to Date.now()
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
 * @returns Promise<boolean> - true if storage successful, false otherwise
 */
export async function storeSecret(
  key: string,
  value: string
): Promise<boolean> {
  const logger = getLogger();
  const core = getCore();

  try {
    logger.debug(`Storing secret for key: ${key}`);
    await core.storeSecret(key, value);
    logger.info(`Secret stored successfully for key: ${key}`);
    return true;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Failed to store secret for key ${key}:`, errorMessage);
    return false;
  }
}

/**
 * Retrieve a secret from the native keychain/keystore
 * @param key - The key to retrieve the secret for
 * @returns Promise<string | null> - The secret value or null if not found
 */
export async function getSecret(key: string): Promise<string | null> {
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

    return result ?? null;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Failed to retrieve secret for key ${key}:`, errorMessage);
    return null;
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
