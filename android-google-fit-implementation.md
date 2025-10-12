# Google Fit Integration Implementation Guide

## Overview
This guide shows how to implement Google Fit auto-sync in the YogicMile Android app using the Google Fitness API.

## Prerequisites
1. Google Cloud Project with Fitness API enabled
2. OAuth 2.0 credentials configured
3. Android app with Google Play Services

## Step 1: Enable Google Fitness API

### Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Enable the **Fitness API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Fitness API"
   - Click "Enable"

4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Android"
   - Enter package name: `com.yogicmile.app`
   - Get SHA-1 fingerprint:
     ```bash
     keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
     ```
   - Enter the SHA-1 fingerprint
   - Click "Create"

## Step 2: Update build.gradle

### app/build.gradle
```gradle
dependencies {
    // Google Play Services - Fitness API
    implementation 'com.google.android.gms:play-services-fitness:21.1.0'
    implementation 'com.google.android.gms:play-services-auth:20.7.0'
    
    // Google Sign-In
    implementation 'com.google.android.gms:play-services-auth:20.7.0'
}
```

## Step 3: Update AndroidManifest.xml

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- Google Fit permissions -->
    <uses-permission android:name="android.permission.ACTIVITY_RECOGNITION" />
    <uses-permission android:name="com.google.android.gms.permission.ACTIVITY_RECOGNITION" />
    <uses-permission android:name="android.permission.GET_ACCOUNTS" />
    <uses-permission android:name="android.permission.USE_CREDENTIALS" />
    
    <application>
        <!-- Google Fit metadata -->
        <meta-data
            android:name="com.google.android.gms.fitness.HISTORY_READ"
            android:value="true" />
        <meta-data
            android:name="com.google.android.gms.fitness.HISTORY_READ_WRITE"
            android:value="true" />
    </application>
</manifest>
```

## Step 4: Create GoogleFitManager.java

```java
package com.yogicmile.app;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.util.Log;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInOptionsExtension;
import com.google.android.gms.fitness.Fitness;
import com.google.android.gms.fitness.FitnessOptions;
import com.google.android.gms.fitness.data.DataPoint;
import com.google.android.gms.fitness.data.DataSet;
import com.google.android.gms.fitness.data.DataType;
import com.google.android.gms.fitness.data.Field;
import com.google.android.gms.fitness.request.DataReadRequest;
import com.google.android.gms.fitness.result.DataReadResponse;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.Tasks;
import java.util.Calendar;
import java.util.concurrent.TimeUnit;

public class GoogleFitManager {
    private static final String TAG = "GoogleFitManager";
    private static final int GOOGLE_FIT_PERMISSIONS_REQUEST_CODE = 1001;
    
    private Context context;
    private FitnessOptions fitnessOptions;
    private GoogleSignInAccount googleAccount;
    
    public GoogleFitManager(Context context) {
        this.context = context;
        
        // Configure fitness options
        this.fitnessOptions = FitnessOptions.builder()
            .addDataType(DataType.TYPE_STEP_COUNT_DELTA, FitnessOptions.ACCESS_READ)
            .addDataType(DataType.AGGREGATE_STEP_COUNT_DELTA, FitnessOptions.ACCESS_READ)
            .addDataType(DataType.TYPE_DISTANCE_DELTA, FitnessOptions.ACCESS_READ)
            .addDataType(DataType.AGGREGATE_DISTANCE_DELTA, FitnessOptions.ACCESS_READ)
            .build();
    }
    
    /**
     * Check if user has granted Google Fit permissions
     */
    public boolean hasPermissions() {
        return GoogleSignIn.hasPermissions(getGoogleAccount(), fitnessOptions);
    }
    
    /**
     * Request Google Fit permissions
     */
    public void requestPermissions(Activity activity) {
        GoogleSignIn.requestPermissions(
            activity,
            GOOGLE_FIT_PERMISSIONS_REQUEST_CODE,
            getGoogleAccount(),
            fitnessOptions
        );
    }
    
    /**
     * Get Google account
     */
    private GoogleSignInAccount getGoogleAccount() {
        if (googleAccount == null) {
            googleAccount = GoogleSignIn.getAccountForExtension(context, fitnessOptions);
        }
        return googleAccount;
    }
    
    /**
     * Sync steps from Google Fit for today
     */
    public Task<Integer> syncTodaySteps() {
        if (!hasPermissions()) {
            Log.w(TAG, "Google Fit permissions not granted");
            return Tasks.forResult(0);
        }
        
        // Get today's date range
        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        long startTime = cal.getTimeInMillis();
        long endTime = System.currentTimeMillis();
        
        // Build read request
        DataReadRequest readRequest = new DataReadRequest.Builder()
            .aggregate(DataType.TYPE_STEP_COUNT_DELTA, DataType.AGGREGATE_STEP_COUNT_DELTA)
            .bucketByTime(1, TimeUnit.DAYS)
            .setTimeRange(startTime, endTime, TimeUnit.MILLISECONDS)
            .build();
        
        // Execute request
        return Fitness.getHistoryClient(context, getGoogleAccount())
            .readData(readRequest)
            .continueWith(task -> {
                if (!task.isSuccessful()) {
                    Log.e(TAG, "Failed to read step data", task.getException());
                    return 0;
                }
                
                DataReadResponse response = task.getResult();
                return extractStepsFromResponse(response);
            });
    }
    
    /**
     * Extract total steps from DataReadResponse
     */
    private int extractStepsFromResponse(DataReadResponse response) {
        int totalSteps = 0;
        
        if (response.getBuckets().isEmpty()) {
            Log.w(TAG, "No data buckets found");
            return 0;
        }
        
        for (com.google.android.gms.fitness.data.Bucket bucket : response.getBuckets()) {
            for (DataSet dataSet : bucket.getDataSets()) {
                for (DataPoint dataPoint : dataSet.getDataPoints()) {
                    for (Field field : dataPoint.getDataType().getFields()) {
                        int steps = dataPoint.getValue(field).asInt();
                        totalSteps += steps;
                        Log.d(TAG, "Steps: " + steps);
                    }
                }
            }
        }
        
        Log.i(TAG, "Total steps from Google Fit: " + totalSteps);
        return totalSteps;
    }
    
    /**
     * Subscribe to step count updates
     */
    public Task<Void> subscribeToStepUpdates() {
        return Fitness.getRecordingClient(context, getGoogleAccount())
            .subscribe(DataType.TYPE_STEP_COUNT_DELTA);
    }
    
    /**
     * Unsubscribe from step count updates
     */
    public Task<Void> unsubscribeFromStepUpdates() {
        return Fitness.getRecordingClient(context, getGoogleAccount())
            .unsubscribe(DataType.TYPE_STEP_COUNT_DELTA);
    }
    
    /**
     * Handle permission result
     */
    public static boolean handlePermissionResult(int requestCode, int resultCode) {
        if (requestCode == GOOGLE_FIT_PERMISSIONS_REQUEST_CODE) {
            return resultCode == Activity.RESULT_OK;
        }
        return false;
    }
}
```

## Step 5: Create GoogleFitPlugin.java (Capacitor Plugin)

```java
package com.yogicmile.app;

import android.app.Activity;
import android.content.Intent;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "GoogleFit")
public class GoogleFitPlugin extends Plugin {
    
    private GoogleFitManager googleFitManager;
    
    @Override
    public void load() {
        googleFitManager = new GoogleFitManager(getContext());
    }
    
    @PluginMethod
    public void isAvailable(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("available", true); // Google Play Services check would go here
        call.resolve(ret);
    }
    
    @PluginMethod
    public void hasPermissions(PluginCall call) {
        boolean has = googleFitManager.hasPermissions();
        
        JSObject ret = new JSObject();
        ret.put("granted", has);
        ret.put("accountConnected", has);
        ret.put("canReadSteps", has);
        ret.put("canReadDistance", has);
        call.resolve(ret);
    }
    
    @PluginMethod
    public void requestPermissions(PluginCall call) {
        saveCall(call);
        Activity activity = getActivity();
        
        if (activity == null) {
            call.reject("Activity not available");
            return;
        }
        
        googleFitManager.requestPermissions(activity);
    }
    
    @ActivityCallback
    private void handlePermissionResult(PluginCall call, ActivityResult result) {
        if (call == null) {
            return;
        }
        
        boolean granted = GoogleFitManager.handlePermissionResult(
            result.getRequestCode(),
            result.getResultCode()
        );
        
        JSObject ret = new JSObject();
        ret.put("granted", granted);
        call.resolve(ret);
    }
    
    @PluginMethod
    public void syncSteps(PluginCall call) {
        googleFitManager.syncTodaySteps().addOnCompleteListener(task -> {
            JSObject ret = new JSObject();
            
            if (task.isSuccessful()) {
                int steps = task.getResult();
                ret.put("success", true);
                ret.put("steps", steps);
                ret.put("lastSyncTime", System.currentTimeMillis());
                ret.put("source", "google_fit");
            } else {
                ret.put("success", false);
                ret.put("steps", 0);
                ret.put("error", task.getException().getMessage());
            }
            
            call.resolve(ret);
        });
    }
    
    @PluginMethod
    public void subscribe(PluginCall call) {
        googleFitManager.subscribeToStepUpdates().addOnCompleteListener(task -> {
            JSObject ret = new JSObject();
            ret.put("success", task.isSuccessful());
            call.resolve(ret);
        });
    }
    
    @PluginMethod
    public void unsubscribe(PluginCall call) {
        googleFitManager.unsubscribeFromStepUpdates().addOnCompleteListener(task -> {
            JSObject ret = new JSObject();
            ret.put("success", task.isSuccessful());
            call.resolve(ret);
        });
    }
}
```

## Step 6: Register Plugin in MainActivity.java

```java
package com.yogicmile.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Register Google Fit plugin
        registerPlugin(GoogleFitPlugin.class);
    }
    
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        // Permission results are handled by Capacitor automatically
    }
}
```

## Step 7: Testing

### Test Permission Flow
```typescript
import { googleFitService } from '@/services/GoogleFitService';

// Initialize and request permissions
const result = await googleFitService.initialize();
console.log('Google Fit initialized:', result);

// Sync steps
const syncResult = await googleFitService.syncSteps();
console.log('Steps synced:', syncResult);
```

### Test Auto-Sync
```typescript
// Subscribe to sync updates
googleFitService.addSyncListener((result) => {
  console.log('Auto-sync result:', result);
  // Update UI with new step count
});

// Start auto-sync (runs every 2 minutes)
googleFitService.startAutoSync();
```

### Test App Lifecycle
```typescript
import { App } from '@capacitor/app';

App.addListener('appStateChange', async ({ isActive }) => {
  if (isActive) {
    // Sync when app becomes active
    await googleFitService.syncOnAppResume();
  }
});
```

## Troubleshooting

### "Permission denied" errors
- Verify OAuth credentials are correct
- Check SHA-1 fingerprint matches
- Ensure Fitness API is enabled in Google Cloud Console

### "GoogleSignInAccount is null"
- User needs to sign in with Google account first
- Request permissions before syncing

### Steps not syncing
- Check if user has Google Fit app installed
- Verify device has recorded steps in Google Fit
- Check date/time range in DataReadRequest

### Background sync not working
- Ensure battery optimization is disabled
- Check foreground service is running
- Verify background location permission granted (if needed)

## Production Checklist

- [ ] OAuth credentials configured for production
- [ ] Fitness API enabled in Google Cloud
- [ ] Privacy policy updated with Google Fit data usage
- [ ] User consent flow implemented
- [ ] Error handling for all Google Fit API calls
- [ ] Fallback to sensor data when Google Fit unavailable
- [ ] Rate limiting implemented (max 1 sync per minute)
- [ ] Analytics tracking for sync success/failure
- [ ] User settings to enable/disable Google Fit sync

## Best Practices

1. **Always check permissions** before making API calls
2. **Handle errors gracefully** - fall back to sensor data
3. **Respect user privacy** - only request needed permissions
4. **Batch sync requests** - avoid excessive API calls
5. **Cache results** - reduce network usage
6. **Merge data intelligently** - combine Google Fit + sensor data
7. **Log sync events** - for debugging and analytics
8. **Update UI in real-time** - show latest step count

## Resources

- [Google Fitness API Documentation](https://developers.google.com/fit)
- [Android Fitness API Guide](https://developers.google.com/fit/android)
- [OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
- [Capacitor Plugin Development](https://capacitorjs.com/docs/plugins)
