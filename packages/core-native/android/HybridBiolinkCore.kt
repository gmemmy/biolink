package com.margelo.nitro.biolink.core

import android.content.Context
import android.content.SharedPreferences
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
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
        private const val PREFS_NAME = "biolink_secure_storage"
        private const val KEY_ALIAS = "biolink_encryption_key"
    }
    
    private val sharedPrefs: SharedPreferences by lazy {
        reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    override fun authenticate(): Promise<Boolean> {
        return Promise.create { resolve, reject ->
            val currentActivity = reactContext.currentActivity
            
            if (currentActivity == null) {
                reject("NO_ACTIVITY", "No current activity available")
                return@create
            }
            
            if (currentActivity !is FragmentActivity) {
                reject("INVALID_ACTIVITY", "Current activity is not a FragmentActivity")
                return@create
            }
            
            val biometricManager = BiometricManager.from(reactContext)
            when (biometricManager.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_WEAK)) {
                BiometricManager.BIOMETRIC_SUCCESS -> {
                }
                BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE -> {
                    reject("NO_BIOMETRICS", "No biometric features available on this device")
                    return@create
                }
                BiometricManager.BIOMETRIC_ERROR_HW_UNAVAILABLE -> {
                    reject("NO_BIOMETRICS", "Biometric features are currently unavailable")
                    return@create
                }
                BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED -> {
                    reject("NO_BIOMETRICS", "No biometric credentials are enrolled")
                    return@create
                }
                else -> {
                    reject("NO_BIOMETRICS", "Biometric authentication is not available")
                    return@create
                }
            }
            
            val executor: Executor = ContextCompat.getMainExecutor(reactContext)
            val biometricPrompt = BiometricPrompt(currentActivity, executor,
                object : BiometricPrompt.AuthenticationCallback() {
                    override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                        super.onAuthenticationError(errorCode, errString)
                        reject("AUTH_ERROR_$errorCode", errString.toString())
                    }
                    
                    override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                        super.onAuthenticationSucceeded(result)
                        resolve(true)
                    }
                    
                    override fun onAuthenticationFailed() {
                        super.onAuthenticationFailed()
                        reject("AUTH_FAILED", "Authentication failed")
                    }
                })
            
            val promptInfo = BiometricPrompt.PromptInfo.Builder()
                .setTitle("Biometric Authentication")
                .setSubtitle("Authenticate to continue")
                .setNegativeButtonText("Cancel")
                .build()
            
            biometricPrompt.authenticate(promptInfo)
        }
    }
    
    override fun storeSecret(key: String, value: String): Promise<Unit> {
        return Promise.create { resolve, reject ->
            try {
                val encryptedValue = encryptData(value)
                sharedPrefs.edit()
                    .putString(key, encryptedValue)
                    .apply()
                resolve(Unit)
            } catch (e: Exception) {
                reject("STORAGE_ERROR", "Failed to store secret: ${e.message}")
            }
        }
    }
    
    override fun getSecret(key: String): Promise<String?> {
        return Promise.create { resolve, reject ->
            try {
                val encryptedValue = sharedPrefs.getString(key, null)
                if (encryptedValue == null) {
                    resolve(null)
                } else {
                    val decryptedValue = decryptData(encryptedValue)
                    resolve(decryptedValue)
                }
            } catch (e: Exception) {
                reject("STORAGE_ERROR", "Failed to retrieve secret: ${e.message}")
            }
        }
    }
    
    private fun generateSecretKey(): SecretKey {
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
        return keyGenerator.generateKey()
    }
    
    private fun getSecretKey(): SecretKey {
        val keyStore = KeyStore.getInstance("AndroidKeyStore")
        keyStore.load(null)
        
        return if (keyStore.containsAlias(KEY_ALIAS)) {
            keyStore.getKey(KEY_ALIAS, null) as SecretKey
        } else {
            generateSecretKey()
        }
    }
    
    private fun encryptData(data: String): String {
        val cipher = Cipher.getInstance("AES/CBC/PKCS7Padding")
        val secretKey = getSecretKey()
        cipher.init(Cipher.ENCRYPT_MODE, secretKey)
        
        val iv = cipher.iv
        val encryptedData = cipher.doFinal(data.toByteArray())
        
        val combined = iv + encryptedData
        return Base64.encodeToString(combined, Base64.DEFAULT)
    }
    
    private fun decryptData(encryptedData: String): String {
        val combined = Base64.decode(encryptedData, Base64.DEFAULT)
        
        val iv = combined.sliceArray(0..15)
        val encrypted = combined.sliceArray(16 until combined.size)
        
        val cipher = Cipher.getInstance("AES/CBC/PKCS7Padding")
        val secretKey = getSecretKey()
        cipher.init(Cipher.DECRYPT_MODE, secretKey, IvParameterSpec(iv))
        
        val decryptedData = cipher.doFinal(encrypted)
        return String(decryptedData)
    }
} 