package com.margelo.nitro.biolink.utils

import android.app.Activity
import androidx.fragment.app.FragmentActivity
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.Deferred
import androidx.core.content.ContextCompat

object ActivityProvider {
    private var _currentActivity: FragmentActivity? = null
    private var _deferredActivity: CompletableDeferred<FragmentActivity>? = null
    private var _biometricPromptManager: BiometricPromptManager? = null

    var currentActivity: FragmentActivity?
        get() = _currentActivity
        set(value) {
            _currentActivity = value
            if (value != null) {
                _deferredActivity?.complete(value)
                _deferredActivity = null // Reset once completed
            }
        }

    suspend fun awaitActivity(): FragmentActivity {
        if (_currentActivity is FragmentActivity) {
            return _currentActivity as FragmentActivity
        }

        // If not available, create a new deferred and wait for it
        _deferredActivity = CompletableDeferred()
        return _deferredActivity!!.await()
    }

    fun getBiometricPromptManager(): BiometricPromptManager? {
        val activity = _currentActivity
        if (activity is FragmentActivity) {
            if (_biometricPromptManager == null || _biometricPromptManager?.activity != activity) {
                _biometricPromptManager = BiometricPromptManager(activity, ContextCompat.getMainExecutor(activity))
            }
            return _biometricPromptManager
        }
        return null
    }

    fun resetDeferred() {
        _deferredActivity?.cancel()
        _deferredActivity = null
        _biometricPromptManager = null
    }
}
