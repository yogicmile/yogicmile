# Android Step Tracking Setup Guide

## Overview
This guide explains how to build and deploy the YogicMile app with native Android step tracking support.

## Prerequisites
- Node.js 16+ installed
- Android Studio installed
- Android SDK (API 26-34) configured
- Git installed

## Step-by-Step Build Instructions

### 1. Transfer Project to GitHub
1. Click "Export to Github" button in Lovable
2. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/YOUR_USERNAME/yogicmile.git
   cd yogicmile
   ```

### 2. Install Dependencies
```bash
npm install
```

### 3. Add Android Platform
```bash
npx cap add android
```

### 4. Update Android Manifest
Copy the permissions from `android-manifest-additions.xml` to `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- Network permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <!-- Step tracking permissions -->
    <uses-permission android:name="android.permission.ACTIVITY_RECOGNITION" />
    <uses-permission android:name="com.google.android.gms.permission.ACTIVITY_RECOGNITION" />
    
    <!-- Location for GPS validation -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
    
    <!-- Notifications -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.VIBRATE" />
    
    <!-- Wake lock for background tracking -->
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_HEALTH" />
    
    <application
        android:allowBackup="true"
        android:usesCleartextTraffic="true">
        
        <!-- Background service for step tracking -->
        <service
            android:name=".StepCounterService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="health" />
            
    </application>
</manifest>
```

### 5. Build the Web Assets
```bash
npm run build
```

### 6. Sync Capacitor
```bash
npx cap sync android
```

### 7. Open in Android Studio
```bash
npx cap open android
```

### 8. Configure Gradle (if needed)
In `android/app/build.gradle`, ensure:
```gradle
android {
    compileSdk 34
    
    defaultConfig {
        minSdk 26
        targetSdk 34
    }
}

dependencies {
    // Google Fit API (fallback tracking)
    implementation 'com.google.android.gms:play-services-fitness:21.1.0'
    implementation 'com.google.android.gms:play-services-auth:20.7.0'
}
```

### 9. Build & Run
In Android Studio:
1. Select your device/emulator
2. Click Run (Shift + F10)

Or via command line:
```bash
npx cap run android
```

## Testing on Physical Devices

### Samsung, OnePlus, Oppo, Vivo, Realme, MI
1. Enable Developer Options:
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times
2. Enable USB Debugging:
   - Settings > Developer Options > USB Debugging
3. Connect device via USB
4. Allow USB debugging on device
5. Run: `npx cap run android`

### Battery Optimization Settings
For reliable background tracking:
1. **Samsung**: Settings > Apps > YogicMile > Battery > Unrestricted
2. **OnePlus**: Settings > Battery > Battery Optimization > YogicMile > Don't Optimize
3. **MI/MIUI**: Settings > Battery & Performance > App Battery Saver > YogicMile > No restrictions
4. **Oppo/ColorOS**: Settings > Battery > App Battery Management > YogicMile > Allow background activity
5. **Vivo**: Settings > Battery > Background Power Consumption Management > YogicMile > Allow

## Troubleshooting

### Step Counter Not Working
- Check if `ACTIVITY_RECOGNITION` permission is granted
- Verify device has TYPE_STEP_COUNTER sensor (most Android 4.4+ devices)
- Check battery optimization settings
- Ensure app has background location permission (Android 10+)

### Google Fit Fallback
If native sensors don't work:
1. User must have Google Play Services
2. User must sign in with Google account
3. App will automatically use Google Fit API as fallback

### Permission Errors
- Android 10+: Background location requires additional permission
- Android 13+: POST_NOTIFICATIONS must be requested at runtime

### Build Errors
- Clean build: `cd android && ./gradlew clean && cd ..`
- Invalidate caches in Android Studio
- Update Android SDK tools

## Native Plugin Development (Optional)

For advanced users who want to implement custom native step tracking:

1. Create Android plugin in `android/app/src/main/java/`:
```java
@NativePlugin
public class StepCounterPlugin extends Plugin {
    private SensorManager sensorManager;
    private Sensor stepSensor;
    
    @Override
    public void load() {
        sensorManager = (SensorManager) getContext().getSystemService(Context.SENSOR_SERVICE);
        stepSensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER);
    }
    
    @PluginMethod
    public void startTracking(PluginCall call) {
        // Implement sensor listener
    }
}
```

2. Register in `MainActivity.java`:
```java
this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
    add(StepCounterPlugin.class);
}});
```

## Production Deployment

### Generate Signed APK
1. Android Studio > Build > Generate Signed Bundle/APK
2. Create new keystore or use existing
3. Select release variant
4. Build APK

### Google Play Store
1. Create app listing in Google Play Console
2. Upload signed APK/AAB
3. Complete store listing
4. Submit for review

## Support

For issues specific to device brands:
- Check manufacturer-specific documentation
- Test on multiple devices before production
- Use Google Fit as reliable fallback

## Performance Tips

- Step counter sensor is battery-efficient (hardware-based)
- Avoid GPS polling unless needed for speed validation
- Use foreground service with notification for Android 8+
- Batch database writes to reduce battery drain
- Cache step counts locally before syncing
