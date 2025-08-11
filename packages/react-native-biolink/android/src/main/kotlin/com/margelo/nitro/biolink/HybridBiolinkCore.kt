package com.margelo.nitro.biolink

import android.content.SharedPreferences
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import com.facebook.react.bridge.ReactApplicationContext
import android.util.Log
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity
import com.margelo.nitro.core.*
import com.margelo.nitro.biolink.SimplePromptOptions
import com.margelo.nitro.biolink.utils.ActivityProvider
import com.margelo.nitro.biolink.utils.BiolinkSharedPrefs
import com.margelo.nitro.biolink.utils.ContextProvider
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import android.util.Base64
import java.security.KeyStore
import java.security.Signature
import java.security.PrivateKey
import java.security.KeyPairGenerator

class HybridBiolinkCore : HybridBiolinkCoreSpec() {
    
    companion object {
        private const val TAG = "BiolinkCore"
        private const val SIGNING_KEY_ALIAS = "biolink_signing_key"
    }
    
    private lateinit var sharedPrefs: SharedPreferences
    
    private fun initializeSharedPrefs() {
        if (!::sharedPrefs.isInitialized) {
            Log.d(TAG, "Initializing sharedPrefs")
            try {
                val context = ContextProvider.context.applicationContext ?: ContextProvider.context
                Log.d(TAG, "Using context: ${context.javaClass.simpleName}")
                sharedPrefs = BiolinkSharedPrefs(context).getPrefs()
                Log.d(TAG, "SharedPrefs initialized successfully")
            } catch (e: Exception) {
                Log.e(TAG, "Failed to initialize sharedPrefs", e)
                throw e
            }
        }
    }

    override fun authenticate(fallbackToDeviceCredential: Boolean?): Promise<Boolean> = Promise.async {
        val fallback = fallbackToDeviceCredential == true
        Log.d(TAG, "authenticate() called with fallback: $fallback")

        val activity = ActivityProvider.awaitActivity()

        if (activity !is FragmentActivity) {
            throw RuntimeException("INVALID_ACTIVITY_TYPE: Current activity is not a FragmentActivity. BiometricPrompt requires a FragmentActivity.")
        }

        val authenticators = if (fallback) {
            BiometricManager.Authenticators.BIOMETRIC_WEAK or BiometricManager.Authenticators.DEVICE_CREDENTIAL
        } else {
            BiometricManager.Authenticators.BIOMETRIC_WEAK
        }

        when (BiometricManager.from(ContextProvider.context).canAuthenticate(authenticators)) {
            BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE,
            BiometricManager.BIOMETRIC_ERROR_HW_UNAVAILABLE,
            BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED -> {
                throw RuntimeException("NO_BIOMETRICS: Biometric/credential not available or not enrolled")
            }
            BiometricManager.BIOMETRIC_SUCCESS -> {
                Log.d(TAG, "Biometric authentication is available")
            }
            else -> {
                throw RuntimeException("NO_AUTH: Authentication not available")
            }
        }

        val biometricPromptManager = ActivityProvider.getBiometricPromptManager()
            ?: throw RuntimeException("BiometricPromptManager not initialized. Activity may not be in a valid state.")

        val promptInfo = BiometricPrompt.PromptInfo.Builder()
            .setTitle("Authentication Required")
            .apply {
                if (fallback) {
                    setAllowedAuthenticators(authenticators)
                } else {
                    setAllowedAuthenticators(authenticators)
                    setNegativeButtonText("Cancel")
                }
            }
            .build()

        val deferredResult = biometricPromptManager.showPrompt(promptInfo)
        deferredResult.await()
    }
    
    override fun storeSecret(key: String, value: String): Promise<Unit> = Promise.async {
        Log.d(TAG, "storeSecret() called for key: $key")
        try {
            initializeSharedPrefs()
            sharedPrefs.edit().putString(key, value).apply()
            Log.i(TAG, "Secret stored successfully for key: $key")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to store secret for key: $key", e)
            throw RuntimeException("Failed to store secret: ${e.message}", e)
        }
        Unit
    }
    
    override fun getSecret(key: String): Promise<String?> {
        val promise = Promise<String?>()
        Log.d(TAG, "getSecret() called for key: $key")
        try {
            initializeSharedPrefs()
            val value = sharedPrefs.getString(key, null)
            if (value == null) {
                promise.resolve("")
            } else {
                Log.i(TAG, "Secret retrieved successfully for key: $key value=$value")
                promise.resolve(value)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to get secret for key: $key", e)
            promise.reject(RuntimeException("Failed to get secret: ${e.message}", e))
        }
        return promise
    }
    

    
    override fun signChallenge(challenge: String): Promise<String> = Promise.async {
        Log.d(TAG, "signChallenge() called with challenge length: ${challenge.length}")
        val privateKey = getOrCreateSigningKey()
        val signature = Signature.getInstance("SHA256withRSA")
        signature.initSign(privateKey)
        signature.update(challenge.toByteArray())
        val signatureBytes = signature.sign()
        Base64.encodeToString(signatureBytes, Base64.DEFAULT)
    }
    
    override fun getPublicKey(): Promise<String> = Promise.async {
        Log.d(TAG, "getPublicKey() called")
        val keyStore = KeyStore.getInstance("AndroidKeyStore")
        keyStore.load(null)
        if (!keyStore.containsAlias(SIGNING_KEY_ALIAS)) {
            getOrCreateSigningKey()
        }
        val entry = keyStore.getEntry(SIGNING_KEY_ALIAS, null) as KeyStore.PrivateKeyEntry
        val publicKey = entry.certificate.publicKey
        Base64.encodeToString(publicKey.encoded, Base64.DEFAULT)
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
    
    override fun isSensorAvailable(): Promise<SensorAvailability> = Promise.async {
        Log.d(TAG, "isSensorAvailable() called")
        val biometricManager = BiometricManager.from(ContextProvider.context)
        val canAuth = biometricManager.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_WEAK)
        val available = canAuth == BiometricManager.BIOMETRIC_SUCCESS
        val biometryType = if (available) {
            val pm = ContextProvider.context.packageManager
            when {
                pm.hasSystemFeature("android.hardware.fingerprint") -> BiometryType.TOUCHID
                pm.hasSystemFeature("android.hardware.face") -> BiometryType.FACEID
                else -> BiometryType.BIOMETRICS
            }
        } else {
            BiometryType.NONE
        }
        SensorAvailability(available, biometryType)
    }
    
    override fun biometricKeysExist(): Promise<Boolean> = Promise.async {
        Log.d(TAG, "biometricKeysExist() called")
        val keyStore = KeyStore.getInstance("AndroidKeyStore")
        keyStore.load(null)
        keyStore.containsAlias(SIGNING_KEY_ALIAS)
    }
    
    override fun deleteKeys(): Promise<Unit> = Promise.async {
        Log.d(TAG, "deleteKeys() called")
        val keyStore = KeyStore.getInstance("AndroidKeyStore")
        keyStore.load(null)
        if (keyStore.containsAlias(SIGNING_KEY_ALIAS)) {
            keyStore.deleteEntry(SIGNING_KEY_ALIAS)
        }
        Unit
    }
    
    override fun simplePrompt(options: SimplePromptOptions?): Promise<Boolean> = Promise.async {
        val activity = ActivityProvider.awaitActivity()

        if (activity !is FragmentActivity) {
            throw RuntimeException("INVALID_ACTIVITY_TYPE: Current activity is not a FragmentActivity. BiometricPrompt requires a FragmentActivity.")
        }

        val promptMessage = options?.promptMessage ?: "Authenticate to continue"
        val authenticators = BiometricManager.Authenticators.BIOMETRIC_WEAK or BiometricManager.Authenticators.DEVICE_CREDENTIAL

        when (BiometricManager.from(ContextProvider.context).canAuthenticate(authenticators)) {
            BiometricManager.BIOMETRIC_SUCCESS -> {
                Log.d(TAG, "Biometric authentication is available")
            }
            else -> {
                throw RuntimeException("NO_AUTH: Authentication is not available")
            }
        }

        val biometricPromptManager = ActivityProvider.getBiometricPromptManager()
            ?: throw RuntimeException("BiometricPromptManager not initialized. Activity may not be in a valid state.")

        val promptInfo = BiometricPrompt.PromptInfo.Builder()
            .setTitle("Authentication Required")
            .setSubtitle(promptMessage)
            .setAllowedAuthenticators(authenticators)
            .setNegativeButtonText(options?.cancelButtonText ?: "Cancel")
            .build()

        val deferredResult = biometricPromptManager.showPrompt(promptInfo)
        deferredResult.await()
    }
}
