# Android Build Fix - Native Libraries Included

## What Was Fixed
1. **Removed manual Capacitor plugin references** from `android/app/build.gradle`
   - Capacitor 7 auto-manages plugins via `capacitor.build.gradle`
   - Manual `project(':capacitor-xxx')` references were causing conflicts

2. **Added proper `android/settings.gradle`**
   - Includes `:capacitor-android` module linking to node_modules
   - Includes `:capacitor-cordova-android-plugins`
   - Applies `capacitor.settings.gradle` for auto-generated plugin includes

## Build Instructions

After pulling these changes:

```bash
# 1. Install dependencies
npm install

# 2. Build web assets
npm run build

# 3. Sync Capacitor (this generates capacitor.build.gradle)
npx cap sync android

# 4. Build APK
cd android
gradlew clean
gradlew assembleDebug

# APK location: android/app/build/outputs/apk/debug/app-debug.apk
```

## Expected Results
- APK size: ~13-15 MB (instead of 5 MB)
- `lib/arm64-v8a/` folder with native `.so` libraries
- `lib/armeabi-v7a/` folder with native `.so` libraries
- All Capacitor plugins properly included

## Verification
After building, verify APK contents:
```bash
# Extract and check lib folder
unzip -l app-debug.apk | grep "lib/"
```

You should see native libraries like:
- `lib/arm64-v8a/libc++_shared.so`
- `lib/arm64-v8a/libcapacitor-android.so`
- Multiple architecture folders (armeabi-v7a, arm64-v8a, x86, x86_64)
