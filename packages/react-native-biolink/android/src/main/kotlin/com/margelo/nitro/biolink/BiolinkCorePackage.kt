package com.margelo.nitro.biolink

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import android.app.Application
import com.facebook.react.uimanager.ViewManager
import com.margelo.nitro.biolink.BiolinkCoreOnLoad
import com.margelo.nitro.biolink.BiolinkCoreBridgeModule
import com.margelo.nitro.biolink.utils.ContextProvider
import com.margelo.nitro.biolink.utils.ActivityProvider
import androidx.fragment.app.FragmentActivity

class BiolinkCorePackage : ReactPackage {
    companion object {
        init {
            BiolinkCoreOnLoad.initializeNative()
        }
    }

    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        ContextProvider.context = reactContext
        ActivityProvider.currentActivity = reactContext.currentActivity as? FragmentActivity
        (reactContext.applicationContext as Application).registerActivityLifecycleCallbacks(BiolinkActivityLifecycleCallbacks())
        return listOf(BiolinkCoreBridgeModule(reactContext))
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> =
        emptyList()
}
