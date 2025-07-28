package com.margelo.nitro.biolink.utils

import android.util.Log
import androidx.biometric.BiometricPrompt
import androidx.fragment.app.FragmentActivity
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.concurrent.Executor
import android.os.Handler

class BiometricPromptManager(val activity: FragmentActivity, private val executor: Executor) {

    private val TAG = "BiometricPromptManager"
    private val biometricPrompt: BiometricPrompt
    private var deferredResult: CompletableDeferred<Boolean>? = null

    init {
        biometricPrompt = BiometricPrompt(activity, executor, object : BiometricPrompt.AuthenticationCallback() {
            override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                Log.e(TAG, "Authentication error: $errorCode - $errString")
                deferredResult?.completeExceptionally(RuntimeException("AUTH_FAILED_$errorCode: $errString"))
                deferredResult = null
            }

            override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                Log.d(TAG, "Authentication succeeded")
                deferredResult?.complete(true)
                deferredResult = null
            }

            override fun onAuthenticationFailed() {
                Log.w(TAG, "Authentication failed (user did not provide valid credentials)")
                deferredResult?.completeExceptionally(RuntimeException("AUTH_FAILED_USER_CANCELED: Authentication failed or user canceled"))
                deferredResult = null
            }
        })
    }

    suspend fun showPrompt(promptInfo: BiometricPrompt.PromptInfo): CompletableDeferred<Boolean> {
        deferredResult = CompletableDeferred()

        withContext(Dispatchers.Main) {
            Handler(activity.mainLooper).post {
                try {
                    biometricPrompt.authenticate(promptInfo)
                } catch (e: Exception) {
                    Log.e(TAG, "Error showing biometric prompt: ${e.message}", e)
                    deferredResult?.completeExceptionally(RuntimeException("PROMPT_ERROR: ${e.message}", e))
                    deferredResult = null
                }
            }
        }

        return deferredResult!!
    }
}
