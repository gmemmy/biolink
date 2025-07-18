package com.margelo.nitro.biolink.core

import android.content.Context
import android.content.SharedPreferences
import android.os.SystemClock
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Log
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity
import com.facebook.react.bridge.ReactApplicationContext
import com.margelo.nitro.core.*
import java.util.concurrent.Executor
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.IvParameterSpec
import android.util.Base64
import java.security.KeyStore

class HybridBiolinkCore(private val reactContext: ReactApplicationContext) : HybridBiolinkCoreSpec() {
    
    companion object {
        private const val TAG = "BiolinkCore"
        private const val PREFS_NAME = "biolink_secure_storage"
        private const val KEY_ALIAS = "biolink_encryption_key"
        private const val SIGNING_KEY_ALIAS = "biolink_signing_key"
    }
    
    private val sharedPrefs: SharedPreferences by lazy {
        reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    override fun authenticate(fallbackToDeviceCredential: Boolean?): Promise<Boolean> {
        val fallback = fallbackToDeviceCredential ?: false
        Log.d(TAG, "authenticate() called with fallbackToDeviceCredential: $fallback")
        
        return Promise.create { resolve, reject ->
            val currentActivity = reactContext.currentActivity
            
            if (currentActivity == null) {
                Log.e(TAG, "Authentication failed: NO_ACTIVITY")
                reject("NO_ACTIVITY", "No current activity available")
                return@create
            }
            
            if (currentActivity !is FragmentActivity) {
                Log.e(TAG, "Authentication failed: INVALID_ACTIVITY")
                reject("INVALID_ACTIVITY", "Current activity is not a FragmentActivity")
                return@create
            }
            
            val authenticators = if (fallback) {
                BiometricManager.Authenticators.BIOMETRIC_WEAK or BiometricManager.Authenticators.DEVICE_CREDENTIAL
            } else {
                BiometricManager.Authenticators.BIOMETRIC_WEAK
            }
            
            val biometricManager = BiometricManager.from(reactContext)
            when (biometricManager.canAuthenticate(authenticators)) {
                BiometricManager.BIOMETRIC_SUCCESS -> {
                    Log.d(TAG, "Authentication is available")
                }
                BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE -> {
                    Log.e(TAG, "Authentication failed: NO_BIOMETRICS - No biometric features available")
                    reject("NO_BIOMETRICS", "No biometric features available on this device")
                    return@create
                }
                BiometricManager.BIOMETRIC_ERROR_HW_UNAVAILABLE -> {
                    Log.e(TAG, "Authentication failed: NO_BIOMETRICS - Biometric features unavailable")
                    reject("NO_BIOMETRICS", "Biometric features are currently unavailable")
                    return@create
                }
                BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED -> {
                    if (fallback) {
                        Log.e(TAG, "Authentication failed: NO_CREDENTIALS - No biometric or device credentials enrolled")
                        reject("NO_CREDENTIALS", "No biometric or device credentials are enrolled")
                    } else {
                        Log.e(TAG, "Authentication failed: NO_BIOMETRICS - No biometric credentials enrolled")
                        reject("NO_BIOMETRICS", "No biometric credentials are enrolled")
                    }
                    return@create
                }
                else -> {
                    Log.e(TAG, "Authentication failed: Authentication not available")
                    reject("NO_AUTH", "Authentication is not available")
                    return@create
                }
            }
            
            val executor: Executor = ContextCompat.getMainExecutor(reactContext)
            var startTime: Long = 0
            
            val biometricPrompt = BiometricPrompt(currentActivity, executor, object : BiometricPrompt.AuthenticationCallback() {
                override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                    super.onAuthenticationError(errorCode, errString)
                    val duration = SystemClock.elapsedRealtime() - startTime
                    Log.e(TAG, "Authentication failed: $errorCode - $errString - native took ${duration}ms")
                    reject("AUTH_FAILED_$errorCode", errString.toString())
                }
                
                override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                    super.onAuthenticationSucceeded(result)
                    val duration = SystemClock.elapsedRealtime() - startTime
                    Log.i(TAG, "Authentication successful - native took ${duration}ms")
                    resolve(true)
                }
                
                override fun onAuthenticationFailed() {
                    super.onAuthenticationFailed()
                    val duration = SystemClock.elapsedRealtime() - startTime
                    Log.w(TAG, "Authentication failed - user authentication not recognized - native took ${duration}ms")
                    // Don't reject here - this is called for temporary failures
                }
            })
            
            val promptInfoBuilder = BiometricPrompt.PromptInfo.Builder()
                .setTitle("Authentication Required")
                .setSubtitle("Authenticate to continue")
            
            if (fallback) {
                promptInfoBuilder.setAllowedAuthenticators(authenticators)
            } else {
                // When fallback is disabled, only biometrics are allowed, so we need a cancel button
                promptInfoBuilder.setNegativeButtonText("Cancel")
                    .setAllowedAuthenticators(authenticators)
            }
            
            val promptInfo = promptInfoBuilder.build()
            
            Log.d(TAG, "Starting authentication prompt")
            startTime = SystemClock.elapsedRealtime()
            biometricPrompt.authenticate(promptInfo)
        }
    }
    
    override fun storeSecret(key: String, value: String): Promise<Unit> {
        Log.d(TAG, "storeSecret() called for key: $key")
        
        return Promise.create { resolve, reject ->
            try {
                val secretKey = getOrCreateSecretKey()
                val cipher = Cipher.getInstance("AES/CBC/PKCS7Padding")
                cipher.init(Cipher.ENCRYPT_MODE, secretKey)
                
                val encryptedValue = cipher.doFinal(value.toByteArray())
                val iv = cipher.iv
                
                val encryptedData = Base64.encodeToString(encryptedValue, Base64.DEFAULT)
                val ivString = Base64.encodeToString(iv, Base64.DEFAULT)
                
                sharedPrefs.edit()
                    .putString("${key}_data", encryptedData)
                    .putString("${key}_iv", ivString)
                    .apply()
                
                Log.i(TAG, "Secret stored successfully for key: $key")
                resolve(Unit)
                
            } catch (e: Exception) {
                Log.e(TAG, "Failed to store secret for key $key: ${e.message}", e)
                reject("ENCRYPTION_ERROR", "Failed to encrypt and store secret: ${e.message}")
            }
        }
    }
    
    override fun getSecret(key: String): Promise<String?> {
        Log.d(TAG, "getSecret() called for key: $key")
        
        return Promise.create { resolve, reject ->
            try {
                val encryptedData = sharedPrefs.getString("${key}_data", null)
                val ivString = sharedPrefs.getString("${key}_iv", null)
                
                if (encryptedData == null || ivString == null) {
                    Log.d(TAG, "No secret found for key: $key")
                    resolve(null)
                    return@create
                }
                
                val secretKey = getOrCreateSecretKey()
                val cipher = Cipher.getInstance("AES/CBC/PKCS7Padding")
                val iv = Base64.decode(ivString, Base64.DEFAULT)
                cipher.init(Cipher.DECRYPT_MODE, secretKey, IvParameterSpec(iv))
                
                val encryptedBytes = Base64.decode(encryptedData, Base64.DEFAULT)
                val decryptedBytes = cipher.doFinal(encryptedBytes)
                val decryptedValue = String(decryptedBytes)
                
                Log.i(TAG, "Secret retrieved successfully for key: $key")
                resolve(decryptedValue)
                
            } catch (e: Exception) {
                Log.e(TAG, "Failed to retrieve secret for key $key: ${e.message}", e)
                reject("DECRYPTION_ERROR", "Failed to decrypt secret: ${e.message}")
            }
        }
    }
    
    private fun getOrCreateSecretKey(): SecretKey {
        val keyStore = KeyStore.getInstance("AndroidKeyStore")
        keyStore.load(null)
        
        return if (keyStore.containsAlias(KEY_ALIAS)) {
            keyStore.getKey(KEY_ALIAS, null) as SecretKey
        } else {
            val keyGenerator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
            val keyGenParameterSpec = KeyGenParameterSpec.Builder(
                KEY_ALIAS,
                KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
            )
                .setBlockModes(KeyProperties.BLOCK_MODE_CBC)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_PKCS7)
                .setUserAuthenticationRequired(false)
                .build()
            
            keyGenerator.init(keyGenParameterSpec)
            keyGenerator.generateKey()
        }
    }
    
    override fun signChallenge(challenge: String): Promise<String> {
        Log.d(TAG, "signChallenge() called with challenge length: ${challenge.length}")
        
        return Promise.create { resolve, reject ->
            try {
                val privateKey = getOrCreateSigningKey()
                val signature = Signature.getInstance("SHA256withRSA")
                signature.initSign(privateKey)
                signature.update(challenge.toByteArray())
                
                val signatureBytes = signature.sign()
                val base64Signature = Base64.encodeToString(signatureBytes, Base64.DEFAULT)
                
                Log.i(TAG, "Signature created successfully, length: ${base64Signature.length}")
                resolve(base64Signature)
                
            } catch (e: Exception) {
                Log.e(TAG, "Failed to create signature: ${e.message}", e)
                reject("SIGNATURE_ERROR", "Failed to create signature: ${e.message}")
            }
        }
    }
    
    override fun getPublicKey(): Promise<String> {
        Log.d(TAG, "getPublicKey() called")
        
        return Promise.create { resolve, reject ->
            try {
                val keyStore = KeyStore.getInstance("AndroidKeyStore")
                keyStore.load(null)
                
                if (!keyStore.containsAlias(SIGNING_KEY_ALIAS)) {
                    getOrCreateSigningKey()
                }
                
                val keyPair = keyStore.getEntry(SIGNING_KEY_ALIAS, null) as KeyStore.PrivateKeyEntry
                val publicKey = keyPair.certificate.publicKey
                
                val base64PublicKey = Base64.encodeToString(publicKey.encoded, Base64.DEFAULT)
                
                Log.i(TAG, "Public key retrieved successfully, length: ${base64PublicKey.length}")
                resolve(base64PublicKey)
                
            } catch (e: Exception) {
                Log.e(TAG, "Failed to get public key: ${e.message}", e)
                reject("PUBLIC_KEY_ERROR", "Failed to get public key: ${e.message}")
            }
        }
    }
    
    private fun getOrCreateSigningKey(): PrivateKey {
        val keyStore = KeyStore.getInstance("AndroidKeyStore")
        keyStore.load(null)
        
        return if (keyStore.containsAlias(SIGNING_KEY_ALIAS)) {
            keyStore.getKey(SIGNING_KEY_ALIAS, null) as PrivateKey
        } else {
            val keyPairGenerator = KeyPairGenerator.getInstance(
                KeyProperties.KEY_ALGORITHM_RSA, 
                "AndroidKeyStore"
            )
            
            val keyGenParameterSpec = KeyGenParameterSpec.Builder(
                SIGNING_KEY_ALIAS,
                KeyProperties.PURPOSE_SIGN or KeyProperties.PURPOSE_VERIFY
            )
                .setDigests(KeyProperties.DIGEST_SHA256)
                .setSignaturePaddings(KeyProperties.SIGNATURE_PADDING_RSA_PKCS1)
                .setUserAuthenticationRequired(false)
                .build()
            
            keyPairGenerator.initialize(keyGenParameterSpec)
            val keyPair = keyPairGenerator.generateKeyPair()
            keyPair.private
        }
    }
}
