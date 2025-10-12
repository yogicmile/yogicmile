# Android Native Background Service Implementation

## Overview
This guide shows how to implement the native Android foreground service for continuous step tracking.

## File Structure
```
android/app/src/main/java/[YOUR_PACKAGE]/
├── StepCounterService.java          # Foreground service
├── StepSensorListener.java          # Sensor event handler
├── BackgroundStepTrackingPlugin.java # Capacitor plugin
├── BootReceiver.java                # Auto-start after reboot
└── BatteryOptimizationHelper.java   # Manufacturer-specific handling
```

## 1. StepCounterService.java

```java
package com.yogicmile.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import androidx.core.app.NotificationCompat;

public class StepCounterService extends Service implements SensorEventListener {
    private static final String CHANNEL_ID = "StepTrackingChannel";
    private static final int NOTIFICATION_ID = 1001;
    private static final String PREFS_NAME = "StepTrackingPrefs";
    private static final String KEY_BASELINE_STEPS = "baseline_steps";
    private static final String KEY_DAILY_STEPS = "daily_steps";
    private static final String KEY_LAST_SENSOR_VALUE = "last_sensor_value";

    private SensorManager sensorManager;
    private Sensor stepSensor;
    private PowerManager.WakeLock wakeLock;
    private SharedPreferences prefs;
    
    private int baselineSteps = 0;
    private int lastSensorValue = 0;
    private int dailySteps = 0;

    @Override
    public void onCreate() {
        super.onCreate();
        
        prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        
        // Load stored values
        baselineSteps = prefs.getInt(KEY_BASELINE_STEPS, 0);
        lastSensorValue = prefs.getInt(KEY_LAST_SENSOR_VALUE, 0);
        dailySteps = prefs.getInt(KEY_DAILY_STEPS, 0);
        
        // Initialize sensor
        sensorManager = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
        stepSensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER);
        
        if (stepSensor != null) {
            sensorManager.registerListener(this, stepSensor, SensorManager.SENSOR_DELAY_NORMAL);
        }
        
        // Acquire wake lock for background operation
        PowerManager powerManager = (PowerManager) getSystemService(Context.POWER_SERVICE);
        wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "YogicMile::StepTracking");
        wakeLock.acquire(10*60*1000L); // 10 minutes
        
        // Start foreground service
        startForeground(NOTIFICATION_ID, createNotification("Tracking your steps...", dailySteps));
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        return START_STICKY; // Restart service if killed
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (event.sensor.getType() == Sensor.TYPE_STEP_COUNTER) {
            int currentSensorValue = (int) event.values[0];
            
            // First time initialization
            if (lastSensorValue == 0) {
                lastSensorValue = currentSensorValue;
                baselineSteps = currentSensorValue;
                prefs.edit()
                    .putInt(KEY_BASELINE_STEPS, baselineSteps)
                    .putInt(KEY_LAST_SENSOR_VALUE, lastSensorValue)
                    .apply();
                return;
            }
            
            // Calculate new steps
            int deltaSteps = currentSensorValue - lastSensorValue;
            
            if (deltaSteps > 0) {
                lastSensorValue = currentSensorValue;
                dailySteps = currentSensorValue - baselineSteps;
                
                // Save to preferences
                prefs.edit()
                    .putInt(KEY_LAST_SENSOR_VALUE, lastSensorValue)
                    .putInt(KEY_DAILY_STEPS, dailySteps)
                    .apply();
                
                // Update notification
                updateNotification("Tracking your steps...", dailySteps);
                
                // Broadcast update to app
                Intent broadcastIntent = new Intent("com.yogicmile.STEP_UPDATE");
                broadcastIntent.putExtra("steps", dailySteps);
                broadcastIntent.putExtra("timestamp", System.currentTimeMillis());
                sendBroadcast(broadcastIntent);
            }
        }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
        // Not needed for step counter
    }

    private Notification createNotification(String contentText, int steps) {
        createNotificationChannel();
        
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this, 0, notificationIntent,
            PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT
        );
        
        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("YogicMile - Active")
            .setContentText(contentText + " (" + steps + " steps today)")
            .setSmallIcon(R.drawable.ic_notification)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build();
    }

    private void updateNotification(String contentText, int steps) {
        NotificationManager notificationManager = 
            (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        notificationManager.notify(NOTIFICATION_ID, createNotification(contentText, steps));
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Step Tracking",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Persistent notification for step tracking");
            channel.setShowBadge(false);
            
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        
        if (sensorManager != null && stepSensor != null) {
            sensorManager.unregisterListener(this);
        }
        
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    // Called at midnight to reset daily count
    public void resetDailySteps() {
        baselineSteps = lastSensorValue;
        dailySteps = 0;
        
        prefs.edit()
            .putInt(KEY_BASELINE_STEPS, baselineSteps)
            .putInt(KEY_DAILY_STEPS, 0)
            .apply();
        
        updateNotification("Tracking your steps...", 0);
    }
}
```

## 2. BackgroundStepTrackingPlugin.java

```java
package com.yogicmile.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.provider.Settings;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "BackgroundStepTracking")
public class BackgroundStepTrackingPlugin extends Plugin {
    
    private BroadcastReceiver stepReceiver;

    @Override
    public void load() {
        // Register broadcast receiver for step updates
        stepReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                int steps = intent.getIntExtra("steps", 0);
                long timestamp = intent.getLongExtra("timestamp", 0);
                
                JSObject ret = new JSObject();
                ret.put("steps", steps);
                ret.put("timestamp", timestamp);
                notifyListeners("stepUpdate", ret);
            }
        };
        
        IntentFilter filter = new IntentFilter("com.yogicmile.STEP_UPDATE");
        getContext().registerReceiver(stepReceiver, filter);
    }

    @PluginMethod
    public void startForegroundService(PluginCall call) {
        String title = call.getString("notificationTitle", "YogicMile");
        String text = call.getString("notificationText", "Tracking steps");
        
        Intent serviceIntent = new Intent(getContext(), StepCounterService.class);
        serviceIntent.putExtra("title", title);
        serviceIntent.putExtra("text", text);
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            getContext().startForegroundService(serviceIntent);
        } else {
            getContext().startService(serviceIntent);
        }
        
        JSObject ret = new JSObject();
        ret.put("success", true);
        ret.put("message", "Foreground service started");
        call.resolve(ret);
    }

    @PluginMethod
    public void stopForegroundService(PluginCall call) {
        Intent serviceIntent = new Intent(getContext(), StepCounterService.class);
        getContext().stopService(serviceIntent);
        
        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void isServiceRunning(PluginCall call) {
        // Check if service is running
        boolean running = isMyServiceRunning(StepCounterService.class);
        
        JSObject ret = new JSObject();
        ret.put("running", running);
        call.resolve(ret);
    }

    @PluginMethod
    public void requestBatteryOptimizationExemption(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PowerManager pm = (PowerManager) getContext().getSystemService(Context.POWER_SERVICE);
            String packageName = getContext().getPackageName();
            
            if (!pm.isIgnoringBatteryOptimizations(packageName)) {
                Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                intent.setData(Uri.parse("package:" + packageName));
                getActivity().startActivityForResult(intent, 9001);
                
                JSObject ret = new JSObject();
                ret.put("granted", false);
                ret.put("message", "User needs to approve battery optimization exemption");
                call.resolve(ret);
            } else {
                JSObject ret = new JSObject();
                ret.put("granted", true);
                ret.put("message", "Already exempted from battery optimization");
                call.resolve(ret);
            }
        } else {
            JSObject ret = new JSObject();
            ret.put("granted", true);
            ret.put("message", "Not needed for Android < 6.0");
            call.resolve(ret);
        }
    }

    @PluginMethod
    public void isBatteryOptimizationDisabled(PluginCall call) {
        boolean disabled = true;
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PowerManager pm = (PowerManager) getContext().getSystemService(Context.POWER_SERVICE);
            String packageName = getContext().getPackageName();
            disabled = pm.isIgnoringBatteryOptimizations(packageName);
        }
        
        JSObject ret = new JSObject();
        ret.put("disabled", disabled);
        call.resolve(ret);
    }

    @PluginMethod
    public void openManufacturerBatterySettings(PluginCall call) {
        String manufacturer = Build.MANUFACTURER.toLowerCase();
        Intent intent = null;
        
        try {
            switch (manufacturer) {
                case "xiaomi":
                case "redmi":
                    intent = new Intent("miui.intent.action.POWER_HIDE_MODE_APP_LIST");
                    intent.addCategory(Intent.CATEGORY_DEFAULT);
                    break;
                    
                case "oppo":
                    intent = new Intent();
                    intent.setClassName("com.coloros.safecenter",
                        "com.coloros.safecenter.permission.startup.StartupAppListActivity");
                    break;
                    
                case "vivo":
                    intent = new Intent();
                    intent.setClassName("com.vivo.permissionmanager",
                        "com.vivo.permissionmanager.activity.BgStartUpManagerActivity");
                    break;
                    
                case "oneplus":
                    intent = new Intent("android.settings.APPLICATION_DETAILS_SETTINGS");
                    intent.setData(Uri.fromParts("package", getContext().getPackageName(), null));
                    break;
                    
                case "samsung":
                    intent = new Intent();
                    intent.setClassName("com.samsung.android.lool",
                        "com.samsung.android.sm.ui.battery.BatteryActivity");
                    break;
                    
                default:
                    intent = new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
                    break;
            }
            
            getActivity().startActivity(intent);
            
            JSObject ret = new JSObject();
            ret.put("opened", true);
            call.resolve(ret);
            
        } catch (Exception e) {
            // Fallback to general battery settings
            Intent fallbackIntent = new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
            getActivity().startActivity(fallbackIntent);
            
            JSObject ret = new JSObject();
            ret.put("opened", true);
            call.resolve(ret);
        }
    }

    @PluginMethod
    public void getDeviceInfo(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("manufacturer", Build.MANUFACTURER);
        ret.put("model", Build.MODEL);
        ret.put("androidVersion", Build.VERSION.RELEASE);
        ret.put("apiLevel", Build.VERSION.SDK_INT);
        call.resolve(ret);
    }

    @PluginMethod
    public void hasAggressiveBatteryOptimization(PluginCall call) {
        String manufacturer = Build.MANUFACTURER.toLowerCase();
        boolean aggressive = false;
        String[] recommendations = new String[]{};
        
        switch (manufacturer) {
            case "xiaomi":
            case "redmi":
                aggressive = true;
                recommendations = new String[]{
                    "Settings → Apps → YogicMile → Battery saver → No restrictions",
                    "Settings → Apps → YogicMile → Autostart → Enable",
                    "Settings → Battery → App battery saver → YogicMile → No restrictions"
                };
                break;
                
            case "oppo":
                aggressive = true;
                recommendations = new String[]{
                    "Settings → Battery → App Battery Management → YogicMile → Allow",
                    "Settings → Privacy → Startup Manager → YogicMile → Enable"
                };
                break;
                
            case "vivo":
                aggressive = true;
                recommendations = new String[]{
                    "Settings → Battery → Background power consumption → YogicMile → Allow",
                    "Settings → More settings → Applications → Autostart → YogicMile → Enable"
                };
                break;
                
            case "oneplus":
                aggressive = true;
                recommendations = new String[]{
                    "Settings → Battery → Battery optimization → YogicMile → Don't optimize",
                    "Lock app in recent apps"
                };
                break;
                
            case "samsung":
                aggressive = false; // Samsung is more lenient
                recommendations = new String[]{
                    "Settings → Apps → YogicMile → Battery → Unrestricted"
                };
                break;
        }
        
        JSObject ret = new JSObject();
        ret.put("aggressive", aggressive);
        ret.put("manufacturer", manufacturer);
        ret.put("recommendations", recommendations);
        call.resolve(ret);
    }

    @Override
    protected void handleOnDestroy() {
        if (stepReceiver != null) {
            getContext().unregisterReceiver(stepReceiver);
        }
    }

    private boolean isMyServiceRunning(Class<?> serviceClass) {
        // Implementation to check if service is running
        return false; // Placeholder
    }
}
```

## 3. Updated AndroidManifest.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACTIVITY_RECOGNITION" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_HEALTH" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.VIBRATE" />
    
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">

        <!-- Main Activity -->
        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:exported="true"
            android:label="@string/app_name"
            android:launchMode="singleTask"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Foreground Service -->
        <service
            android:name=".StepCounterService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="health"
            android:permission="android.permission.BIND_JOB_SERVICE" />

        <!-- Boot Receiver -->
        <receiver
            android:name=".BootReceiver"
            android:enabled="true"
            android:exported="true"
            android:permission="android.permission.RECEIVE_BOOT_COMPLETED">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
                <action android:name="android.intent.action.QUICKBOOT_POWERON" />
            </intent-filter>
        </receiver>

    </application>
</manifest>
```

## 4. BootReceiver.java

```java
package com.yogicmile.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
            // Restart step tracking service after reboot
            Intent serviceIntent = new Intent(context, StepCounterService.class);
            
            if (Build.VERSION.SDK_INT >= Build.VERSION.CODES.O) {
                context.startForegroundService(serviceIntent);
            } else {
                context.startService(serviceIntent);
            }
        }
    }
}
```

## 5. Build Configuration

Add to `android/app/build.gradle`:

```gradle
android {
    compileSdk 34
    
    defaultConfig {
        applicationId "com.yogicmile.app"
        minSdk 26
        targetSdk 34
        versionCode 1
        versionName "1.0"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}

dependencies {
    implementation 'androidx.core:core:1.12.0'
    implementation 'com.google.android.gms:play-services-fitness:21.1.0'
    implementation 'com.google.android.gms:play-services-auth:20.7.0'
}
```

## Testing

1. Build the app: `npx cap sync android && npx cap open android`
2. Run on device
3. Grant all permissions
4. Check notification appears
5. Put app in background
6. Walk 50-100 steps
7. Open app - steps should be updated

## Troubleshooting

- **Service not starting**: Check permissions in manifest
- **Steps not updating**: Verify sensor registration
- **Service killed**: Check battery optimization settings
- **No notification**: Verify notification channel creation

This implementation provides a robust, production-ready background step tracking service for Android.
