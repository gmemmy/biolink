package com.margelo.nitro.biolink

import android.app.Activity
import android.app.Application
import android.util.Log
import android.os.Bundle
import androidx.fragment.app.FragmentActivity
import com.margelo.nitro.biolink.utils.ActivityProvider

class BiolinkActivityLifecycleCallbacks : Application.ActivityLifecycleCallbacks {
    override fun onActivityCreated(activity: Activity, savedInstanceState: Bundle?) {
        // Not used
    }

    override fun onActivityStarted(activity: Activity) {
        // Not used
    }

    override fun onActivityResumed(activity: Activity) {
        Log.d("BiolinkActivityLifecycle", "Activity resumed: ${activity.javaClass.simpleName}")
        if (activity is FragmentActivity) {
            ActivityProvider.currentActivity = activity
        }
    }

    override fun onActivityPaused(activity: Activity) {
        // No action needed here, as the activity might just be temporarily paused.
        // We only clear the activity reference when it's destroyed.
    }

    override fun onActivityStopped(activity: Activity) {
        // Not used
    }

    override fun onActivitySaveInstanceState(activity: Activity, outState: Bundle) {
        // Not used
    }

    override fun onActivityDestroyed(activity: Activity) {
        if (ActivityProvider.currentActivity == activity) {
            Log.d("BiolinkActivityLifecycle", "Activity destroyed: ${activity.javaClass.simpleName}")
            ActivityProvider.currentActivity = null
            ActivityProvider.resetDeferred()
        }
    }
}
