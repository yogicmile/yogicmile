package app.lovable.yogicmile.steps

import android.Manifest
import android.app.ActivityManager
import android.content.BroadcastReceiver
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.localbroadcastmanager.content.LocalBroadcastManager
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.Permission
import com.getcapacitor.annotation.PermissionCallback
import java.util.Locale

@CapacitorPlugin(
    name = "BackgroundStepTracking",
    permissions = [
        Permission(strings = [Manifest.permission.ACTIVITY_RECOGNITION], alias = "activity"),
        Permission(strings = [Manifest.permission.POST_NOTIFICATIONS], alias = "notifications")
    ]
)
class BackgroundStepTrackingPlugin : Plugin() {
    
    private val stepUpdateReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            if (intent?.action == StepCounterService.ACTION_STEPS_UPDATED) {
                val steps = intent.getIntExtra(StepCounterService.EXTRA_STEPS, 0)
                val sessionSteps = intent.getIntExtra(StepCounterService.EXTRA_SESSION_STEPS, 0)
                val timestamp = intent.getLongExtra(StepCounterService.EXTRA_TIMESTAMP, 0L)
                
                val data = JSObject()
                data.put("steps", steps)
                data.put("sessionSteps", sessionSteps)
                data.put("timestamp", timestamp)
                
                notifyListeners("step", data)
            }
        }
    }

    override fun load() {
        super.load()
        // Register broadcast receiver
        val filter = IntentFilter(StepCounterService.ACTION_STEPS_UPDATED)
        LocalBroadcastManager.getInstance(context).registerReceiver(stepUpdateReceiver, filter)
    }

    override fun handleOnDestroy() {
        LocalBroadcastManager.getInstance(context).unregisterReceiver(stepUpdateReceiver)
        super.handleOnDestroy()
    }

    @PluginMethod
    fun requestPermissions(call: PluginCall) {
        val permissions = mutableListOf<String>()
        
        // Activity Recognition (Android 10+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            if (ContextCompat.checkSelfPermission(context, Manifest.permission.ACTIVITY_RECOGNITION)
                != PackageManager.PERMISSION_GRANTED) {
                permissions.add(Manifest.permission.ACTIVITY_RECOGNITION)
            }
        }
        
        if (permissions.isEmpty()) {
            val result = JSObject()
            result.put("activityRecognition", true)
            result.put("notifications", true)
            result.put("allGranted", true)
            call.resolve(result)
            return
        }
        
        requestPermissionForAliases(permissions.toTypedArray(), call, "permissionsCallback")
    }

    @PluginMethod
    fun requestAllPermissions(call: PluginCall) {
        val permissions = mutableListOf<String>()
        
        // Activity Recognition (Android 10+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            if (ContextCompat.checkSelfPermission(context, Manifest.permission.ACTIVITY_RECOGNITION)
                != PackageManager.PERMISSION_GRANTED) {
                permissions.add(Manifest.permission.ACTIVITY_RECOGNITION)
            }
        }
        
        // Notifications (Android 13+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED) {
                permissions.add(Manifest.permission.POST_NOTIFICATIONS)
            }
        }
        
        if (permissions.isEmpty()) {
            val result = JSObject()
            result.put("activityRecognition", true)
            result.put("notifications", true)
            result.put("allGranted", true)
            call.resolve(result)
            return
        }
        
        requestPermissionForAliases(permissions.toTypedArray(), call, "allPermissionsCallback")
    }

    @PermissionCallback
    private fun permissionsCallback(call: PluginCall) {
        val activityGranted = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            getPermissionState("activity") == PermissionState.GRANTED
        } else {
            true
        }
        
        val result = JSObject()
        result.put("activityRecognition", activityGranted)
        result.put("notifications", true)
        result.put("allGranted", activityGranted)
        
        call.resolve(result)
    }

    @PermissionCallback
    private fun allPermissionsCallback(call: PluginCall) {
        val activityGranted = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            getPermissionState("activity") == PermissionState.GRANTED
        } else {
            true
        }
        
        val notificationsGranted = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            getPermissionState("notifications") == PermissionState.GRANTED
        } else {
            true
        }
        
        val result = JSObject()
        result.put("activityRecognition", activityGranted)
        result.put("notifications", notificationsGranted)
        result.put("allGranted", activityGranted && notificationsGranted)
        
        call.resolve(result)
    }

    @PluginMethod
    fun startForegroundService(call: PluginCall) {
        val notificationTitle = call.getString("notificationTitle", "Yogic Mile")
        val notificationText = call.getString("notificationText", "Tracking steps in background")
        
        val serviceIntent = Intent(context, StepCounterService::class.java).apply {
            putExtra("notificationTitle", notificationTitle)
            putExtra("notificationText", notificationText)
        }
        
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent)
            } else {
                context.startService(serviceIntent)
            }
            
            val result = JSObject()
            result.put("success", true)
            result.put("message", "Foreground service started")
            call.resolve(result)
        } catch (e: Exception) {
            val result = JSObject()
            result.put("success", false)
            result.put("message", "Failed to start service: ${e.message}")
            call.resolve(result)
        }
    }

    @PluginMethod
    fun stopForegroundService(call: PluginCall) {
        val serviceIntent = Intent(context, StepCounterService::class.java)
        context.stopService(serviceIntent)
        
        val result = JSObject()
        result.put("success", true)
        call.resolve(result)
    }

    @PluginMethod
    fun isServiceRunning(call: PluginCall) {
        val manager = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val running = manager.getRunningServices(Integer.MAX_VALUE).any {
            it.service.className == StepCounterService::class.java.name
        }
        
        val result = JSObject()
        result.put("running", running)
        call.resolve(result)
    }

    @PluginMethod
    fun getStepCount(call: PluginCall) {
        val prefs = context.getSharedPreferences("StepTracking", Context.MODE_PRIVATE)
        val steps = prefs.getInt("today_steps", 0)
        
        val result = JSObject()
        result.put("steps", steps)
        result.put("timestamp", System.currentTimeMillis())
        call.resolve(result)
    }

    @PluginMethod
    fun addStepListener(call: PluginCall) {
        // Listeners are handled via BroadcastReceiver
        call.resolve()
    }

    @PluginMethod
    fun removeStepListener(call: PluginCall) {
        // Listeners are handled via BroadcastReceiver
        call.resolve()
    }

    @PluginMethod
    fun requestBatteryOptimizationExemption(call: PluginCall) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
            val packageName = context.packageName
            
            if (!powerManager.isIgnoringBatteryOptimizations(packageName)) {
                try {
                    val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                        data = Uri.parse("package:$packageName")
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    context.startActivity(intent)
                    
                    val result = JSObject()
                    result.put("granted", false)
                    result.put("message", "User interaction required")
                    call.resolve(result)
                } catch (e: Exception) {
                    val result = JSObject()
                    result.put("granted", false)
                    result.put("message", "Failed to request exemption: ${e.message}")
                    call.resolve(result)
                }
            } else {
                val result = JSObject()
                result.put("granted", true)
                result.put("message", "Already exempted")
                call.resolve(result)
            }
        } else {
            val result = JSObject()
            result.put("granted", true)
            result.put("message", "Not required on this Android version")
            call.resolve(result)
        }
    }

    @PluginMethod
    fun isBatteryOptimizationDisabled(call: PluginCall) {
        val disabled = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
            powerManager.isIgnoringBatteryOptimizations(context.packageName)
        } else {
            true
        }
        
        val result = JSObject()
        result.put("disabled", disabled)
        call.resolve(result)
    }

    @PluginMethod
    fun openManufacturerBatterySettings(call: PluginCall) {
        val manufacturer = Build.MANUFACTURER.toLowerCase(Locale.ROOT)
        
        val intent = when {
            manufacturer.contains("xiaomi") || manufacturer.contains("redmi") -> 
                Intent("miui.intent.action.POWER_HIDE_MODE_APP_LIST")
            manufacturer.contains("huawei") -> 
                Intent().setComponent(ComponentName("com.huawei.systemmanager", "com.huawei.systemmanager.optimize.process.ProtectActivity"))
            manufacturer.contains("oppo") || manufacturer.contains("realme") -> 
                Intent().setComponent(ComponentName("com.coloros.safecenter", "com.coloros.safecenter.permission.startup.StartupAppListActivity"))
            manufacturer.contains("vivo") -> 
                Intent().setComponent(ComponentName("com.vivo.permissionmanager", "com.vivo.permissionmanager.activity.BgStartUpManagerActivity"))
            manufacturer.contains("samsung") -> 
                Intent().setAction("com.samsung.android.sm.ACTION_BATTERY")
            manufacturer.contains("oneplus") -> 
                Intent().setAction(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                    data = Uri.fromParts("package", context.packageName, null)
                }
            else -> Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)
        }
        
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        
        try {
            context.startActivity(intent)
            val result = JSObject()
            result.put("opened", true)
            call.resolve(result)
        } catch (e: Exception) {
            // Fallback to general battery settings
            try {
                context.startActivity(Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                })
                val result = JSObject()
                result.put("opened", true)
                call.resolve(result)
            } catch (e2: Exception) {
                val result = JSObject()
                result.put("opened", false)
                call.resolve(result)
            }
        }
    }

    @PluginMethod
    fun getDeviceInfo(call: PluginCall) {
        val result = JSObject()
        result.put("manufacturer", Build.MANUFACTURER)
        result.put("model", Build.MODEL)
        result.put("androidVersion", Build.VERSION.RELEASE)
        result.put("apiLevel", Build.VERSION.SDK_INT)
        call.resolve(result)
    }

    @PluginMethod
    fun hasAggressiveBatteryOptimization(call: PluginCall) {
        val manufacturer = Build.MANUFACTURER.toLowerCase(Locale.ROOT)
        
        val aggressive = manufacturer.contains("xiaomi") ||
                        manufacturer.contains("redmi") ||
                        manufacturer.contains("huawei") ||
                        manufacturer.contains("oppo") ||
                        manufacturer.contains("realme") ||
                        manufacturer.contains("vivo") ||
                        manufacturer.contains("samsung") ||
                        manufacturer.contains("oneplus")
        
        val recommendations = mutableListOf<String>()
        
        when {
            manufacturer.contains("xiaomi") || manufacturer.contains("redmi") -> {
                recommendations.add("Enable Autostart permission")
                recommendations.add("Disable MIUI Optimization in Developer Options")
                recommendations.add("Set 'No restrictions' in battery settings")
                recommendations.add("Lock app in recent apps")
            }
            manufacturer.contains("oppo") || manufacturer.contains("realme") -> {
                recommendations.add("Allow app to run in background")
                recommendations.add("Enable High-performance mode")
                recommendations.add("Lock app in recent apps")
            }
            manufacturer.contains("vivo") -> {
                recommendations.add("Allow background activity")
                recommendations.add("Disable battery optimization")
            }
            manufacturer.contains("samsung") -> {
                recommendations.add("Remove from 'Sleeping apps'")
                recommendations.add("Remove from 'Deep sleeping apps'")
                recommendations.add("Turn off adaptive battery")
            }
            manufacturer.contains("oneplus") -> {
                recommendations.add("Disable battery optimization")
                recommendations.add("Allow background activity")
            }
        }
        
        val result = JSObject()
        result.put("aggressive", aggressive)
        result.put("manufacturer", Build.MANUFACTURER)
        result.put("recommendations", recommendations.joinToString("|"))
        call.resolve(result)
    }

    // Stub methods for Google Fit (optional future implementation)
    @PluginMethod
    fun isGoogleFitAvailable(call: PluginCall) {
        val result = JSObject()
        result.put("available", false)
        call.resolve(result)
    }

    @PluginMethod
    fun requestGoogleFitPermission(call: PluginCall) {
        val result = JSObject()
        result.put("granted", false)
        call.resolve(result)
    }

    @PluginMethod
    fun syncWithGoogleFit(call: PluginCall) {
        val result = JSObject()
        result.put("success", false)
        result.put("steps", 0)
        call.resolve(result)
    }
}
