package com.margelo.nitro.biolink

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap

import androidx.fragment.app.FragmentActivity

import com.margelo.nitro.biolink.HybridBiolinkCore
import com.margelo.nitro.biolink.SimplePromptOptions

class BiolinkCoreBridgeModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    private val core by lazy { 
        android.util.Log.d("BiolinkCoreBridge", "Initializing HybridBiolinkCore")
        try {
            val coreInstance = HybridBiolinkCore()
            android.util.Log.d("BiolinkCoreBridge", "HybridBiolinkCore initialized successfully")
            coreInstance
        } catch (e: Exception) {
            android.util.Log.e("BiolinkCoreBridge", "Failed to initialize HybridBiolinkCore", e)
            throw e
        }
    }

    override fun getName(): String = "BiolinkCore"

    @ReactMethod
    fun authenticate(fallback: Boolean, promise: Promise) {
        core.authenticate(fallback)
            .then { promise.resolve(it) }
            .catch { t -> promise.reject("AUTH_ERROR", t.message, t) }
    }

    @ReactMethod
    fun storeSecret(key: String, value: String, promise: Promise) {
        core.storeSecret(key, value)
            .then { promise.resolve(null) }
            .catch { t -> promise.reject("STORE_ERROR", t.message, t) }
    }

    @ReactMethod
    fun getSecret(key: String, promise: Promise) {
        core.getSecret(key)
            .then { value -> promise.resolve(value) }
            .catch { t -> promise.reject("GET_ERROR", t.message, t) }
    }

    @ReactMethod
    fun signChallenge(challenge: String, promise: Promise) {
        core.signChallenge(challenge)
            .then { signature -> promise.resolve(signature) }
            .catch { t -> promise.reject("SIGN_ERROR", t.message, t) }
    }

    @ReactMethod
    fun getPublicKey(promise: Promise) {
        core.getPublicKey()
            .then { pubKey -> promise.resolve(pubKey) }
            .catch { t -> promise.reject("PUBKEY_ERROR", t.message, t) }
    }

    @ReactMethod
    fun isSensorAvailable(promise: Promise) {
        core.isSensorAvailable()
            .then { sensorAvailability ->
                val result = com.facebook.react.bridge.Arguments.createMap().apply {
                    putBoolean("available", sensorAvailability.available)
                    putString("biometryType", sensorAvailability.biometryType.name)
                }
                promise.resolve(result)
            }
            .catch { t -> promise.reject("SENSOR_ERROR", t.message, t) }
    }

    @ReactMethod
    fun biometricKeysExist(promise: Promise) {
        core.biometricKeysExist()
            .then { exists -> promise.resolve(exists) }
            .catch { t -> promise.reject("KEYS_ERROR", t.message, t) }
    }

    @ReactMethod
    fun deleteKeys(promise: Promise) {
        core.deleteKeys()
            .then { promise.resolve(null) }
            .catch { t -> promise.reject("DELETE_KEYS_ERROR", t.message, t) }
    }

    @ReactMethod
    fun simplePrompt(options: ReadableMap?, promise: Promise) {
        val promptOptions = options?.let { map ->
            SimplePromptOptions(
                promptMessage = map.getString("promptMessage"),
                cancelButtonText = map.getString("cancelButtonText")
            )
        }
        core.simplePrompt(promptOptions)
            .then { promise.resolve(it) }
            .catch { t -> promise.reject("PROMPT_ERROR", t.message, t) }
    }
}
