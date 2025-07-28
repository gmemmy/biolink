package com.margelo.nitro.biolink.utils

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

class BiolinkSharedPrefs(private val context: Context) {
    
    companion object {
        private const val TAG = "BiolinkSharedPrefs"
        private const val PREFS_NAME = "biolink_secure_storage"
    }
    
    fun getPrefs(): SharedPreferences {
        try {
            Log.d(TAG, "Initializing encrypted shared preferences")
            val masterKey = MasterKey.Builder(context)
                .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
                .build()
            
            val prefs = EncryptedSharedPreferences.create(
                context,
                PREFS_NAME,
                masterKey,
                EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
            )
            Log.d(TAG, "Encrypted shared preferences initialized successfully")
            return prefs
        } catch (e: Exception) {
            Log.e(TAG, "Failed to initialize encrypted shared preferences", e)
            throw RuntimeException("Failed to initialize secure storage: ${e.message}", e)
        }
    }
}