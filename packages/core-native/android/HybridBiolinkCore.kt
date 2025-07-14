package com.margelo.nitro.biolink.core

import android.content.Context
import android.content.SharedPreferences
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
    }
    
    private val sharedPrefs: SharedPreferences by lazy {
        reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    override fun authenticate(): Promise<Boolean> {
        Log.d(TAG, "authenticate() called")
        
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
            
            val biometricManager = BiometricManager.from(reactContext)
            when (biometricManager.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_WEAK)) {
                BiometricManager.BIOMETRIC_SUCCESS -> {
                    Log.d(TAG, "Biometric authentication is available")
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
                    Log.e(TAG, "Authentication failed: NO_BIOMETRICS - No biometric credentials enrolled")
                    reject("NO_BIOMETRICS", "No biometric credentials are enrolled")
                    return@create
                }
                else -> {
                    Log.e(TAG, "Authentication failed: NO_BIOMETRICS - Biometric authentication not available")
                    reject("NO_BIOMETRICS", "Biometric authentication is not available")
                    return@create
                }
            }
            
            val executor: Executor = ContextCompat.getMainExecutor(reactContext)
            val biometricPrompt = BiometricPrompt(currentActivity, executor, object : BiometricPrompt.AuthenticationCallback() {
                override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                    super.onAuthenticationError(errorCode, errString)
                    Log.e(TAG, "Authentication failed: $errorCode - $errString")
                    reject("AUTH_FAILED_$errorCode", errString.toString())
                }
                
                override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                    super.onAuthenticationSucceeded(result)
                    Log.i(TAG, "Biometric authentication successful")
                    resolve(true)
                }
                
                override fun onAuthenticationFailed() {
                    super.onAuthenticationFailed()
                    Log.w(TAG, "Biometric authentication failed - user authentication not recognized")
                    // Don't reject here - this is called for temporary failures
                }
            })
            
            val promptInfo = BiometricPrompt.PromptInfo.Builder()
                .setTitle("Biometric Authentication")
                .setSubtitle("Authenticate to continue")
                .setNegativeButtonText("Cancel")
                .build()
            
            Log.d(TAG, "Starting biometric prompt")
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
} 