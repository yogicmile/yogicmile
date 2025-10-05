# Android Health Connect Setup

## Required Steps:

### 1. Update AndroidManifest.xml
Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<!-- Health Connect Permissions -->
<uses-permission android:name="android.permission.health.READ_STEPS"/>
<uses-permission android:name="android.permission.health.READ_DISTANCE"/>
<uses-permission android:name="android.permission.health.READ_TOTAL_CALORIES_BURNED"/>

<!-- Declare Health Connect integration -->
<application>
    <activity android:name="androidx.health.connect.client.PermissionActivity" 
              android:exported="true"/>
    
    <!-- Metadata for Health Connect -->
    <meta-data
        android:name="androidx.health.HEALTH_CONNECT_CLIENT_VERSION"
        android:value="1" />
</application>
```

### 2. Update build.gradle
Add to `android/app/build.gradle`:

```gradle
dependencies {
    // Health Connect
    implementation "androidx.health.connect:connect-client:1.1.0-alpha07"
}
```

### 3. Sync Capacitor
```bash
npx cap sync android
```

### 4. Build and Run
```bash
npx cap open android
```

Then build and run from Android Studio.

## Testing on Device:
- Install Health Connect app from Play Store
- Grant permissions when prompted
- Ensure Google Fit or other fitness apps are syncing data

## Data Sources:
- Google Fit
- Samsung Health
- Fitbit (via Health Connect)
- Other fitness apps that write to Health Connect
