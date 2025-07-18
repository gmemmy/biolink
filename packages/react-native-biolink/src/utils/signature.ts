import { getLogger } from '../logger';
import type { BiolinkCore } from '../../specs/BiolinkCore.nitro';

const logger = getLogger();

let coreInstance: BiolinkCore | null = null;
let publicKeyCache: string | null = null;
let isSigningAvailableCache: boolean | null = null;

async function getCoreInstance(): Promise<BiolinkCore> {
  if (!coreInstance) {
    const { NitroModules } = await import('react-native-nitro-modules');
    coreInstance = NitroModules.get<BiolinkCore>('BiolinkCore');
  }
  return coreInstance;
}

export function __setCoreForTesting(mockCore: BiolinkCore | null) {
  coreInstance = mockCore;
  publicKeyCache = null;
  isSigningAvailableCache = null;
}

async function getCachedPublicKey(): Promise<string> {
  if (publicKeyCache === null) {
    const core = await getCoreInstance();
    publicKeyCache = await core.getPublicKey();
  }
  return publicKeyCache;
}

/**
 * Reset the signature cache
 */
export function __resetSignatureCache() {
  coreInstance = null;
  publicKeyCache = null;
  isSigningAvailableCache = null;
}

/**
 * Signature header configuration
 */
export const SIGNATURE_CONFIG = {
  BODY_SIGNATURE_HEADER: 'X-Body-Signature',
  PUBLIC_KEY_HEADER: 'X-Public-Key',
} as const;

/**
 * Generate signature headers for a request body
 *
 * @param body - The request body to sign (will be stringified if not already a string)
 * @param headerName - Optional custom header name (defaults to X-Body-Signature)
 * @returns Promise<Record<string, string>> - Object with signature headers
 *
 * @example
 * ```typescript
 * const headers = await getSignatureHeaders({ userId: 123, action: 'login' });
 * // Returns: { 'X-Body-Signature': 'base64-signature-here' }
 *
 * // Use with fetch
 * const response = await fetch('/api/authenticate', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json',
 *     ...headers
 *   },
 *   body: JSON.stringify({ userId: 123, action: 'login' })
 * });
 * ```
 */
export async function getSignatureHeaders(
  body: string | object,
  headerName: string = SIGNATURE_CONFIG.BODY_SIGNATURE_HEADER
): Promise<Record<string, string>> {
  const logger = getLogger();
  try {
    const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
    logger.debug(`Signing request body: ${bodyString.substring(0, 100)}...`);

    const core = await getCoreInstance();
    const signature = await core.signChallenge(bodyString);
    logger.debug(`Generated signature: ${signature.substring(0, 20)}...`);

    return {
      [headerName]: signature,
    };
  } catch (error) {
    logger.error('Failed to generate signature headers:', error);
    throw new Error(
      `Signature generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Generate signature headers with public key included
 *
 * @param body - The request body to sign
 * @param includePublicKey - Whether to include the public key header (default: true)
 * @returns Promise<Record<string, string>> - Object with signature and optional public key headers
 *
 * @example
 * ```typescript
 * const headers = await getSignatureHeadersWithPublicKey({ userId: 123 });
 * // Returns: {
 * //   'X-Body-Signature': 'base64-signature-here',
 * //   'X-Public-Key': 'base64-public-key-here'
 * // }
 * ```
 */
export async function getSignatureHeadersWithPublicKey(
  body: string | object,
  includePublicKey = true
): Promise<Record<string, string>> {
  const logger = getLogger();
  try {
    const signatureHeaders = await getSignatureHeaders(body);
    if (includePublicKey) {
      const publicKey = await getCachedPublicKey();
      logger.debug(`Retrieved public key: ${publicKey.substring(0, 20)}...`);
      return {
        ...signatureHeaders,
        [SIGNATURE_CONFIG.PUBLIC_KEY_HEADER]: publicKey,
      };
    }
    return signatureHeaders;
  } catch (error) {
    logger.error(
      'Failed to generate signature headers with public key:',
      error
    );
    throw new Error(
      `Signature generation with public key failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Verify that signing capabilities are available
 *
 * @returns Promise<boolean> - True if signing is available, false otherwise
 */
export async function isSigningAvailable(): Promise<boolean> {
  if (isSigningAvailableCache !== null) return isSigningAvailableCache;
  try {
    const core = await getCoreInstance();
    await core.getPublicKey();
    isSigningAvailableCache = true;
    return true;
  } catch (error) {
    logger.warn('Signing capabilities not available:', error);
    isSigningAvailableCache = false;
    return false;
  }
}
