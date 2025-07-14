import { useState, useCallback } from 'react';
import { NitroModules } from 'react-native-nitro-modules';
import type { BiolinkCore } from '@biolink/core-native/specs/BiolinkCore.nitro';

const core = NitroModules.createHybridObject<BiolinkCore>('BiolinkCore');

/**
 * Sign in with biometrics using the native authentication
 * @returns Promise<boolean> - true if authentication successful, false otherwise
 */
export async function signInWithBiometrics(): Promise<boolean> {
  try {
    return await core.authenticate();
  } catch (error) {
    console.error('Biometric authentication failed:', error);
    return false;
  }
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
  try {
    await core.storeSecret(key, value);
    return true;
  } catch (error) {
    console.error('Failed to store secret:', error);
    return false;
  }
}

/**
 * Retrieve a secret from the native keychain/keystore
 * @param key - The key to retrieve the secret for
 * @returns Promise<string | null> - The secret value or null if not found
 */
export async function getSecret(key: string): Promise<string | null> {
  try {
    const result = await core.getSecret(key);
    return result ?? null;
  } catch (error) {
    console.error('Failed to retrieve secret:', error);
    return null;
  }
}

export type AuthState = {
  isAuthenticated: boolean;
  error: string | null;
  isLoading: boolean;
};

export type AuthActions = {
  authenticate: () => Promise<void>;
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

  const authenticate = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await signInWithBiometrics();
      if (success) {
        setIsAuthenticated(true);
      } else {
        setError('Authentication failed');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setIsAuthenticated(false);
    setError(null);
    setIsLoading(false);
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

export type { BiolinkCore } from '@biolink/core-native/specs/BiolinkCore.nitro';
