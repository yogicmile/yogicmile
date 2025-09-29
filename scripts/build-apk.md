# Production APK Build Instructions

## Prerequisites
1. Android Studio installed
2. Java Development Kit (JDK) 11 or higher
3. Android SDK with API level 33+

## Step-by-Step Build Process

### 1. Clean and Build
```bash
# Clean previous builds
rm -rf dist/ android/

# Install dependencies
npm install

# Build for production
npm run build

# Sync with Capacitor
npx cap sync android
```

### 2. Open in Android Studio
```bash
npx cap open android
```

### 3. Generate Signed APK in Android Studio

#### A. Create Keystore (First time only)
1. Go to **Build** → **Generate Signed Bundle/APK**
2. Select **APK** → **Next**
3. Click **Create new...** to create a keystore
4. Fill in the keystore details:
   - **Key store path**: Choose location (e.g., `./android/yogicmile.keystore`)
   - **Password**: Create a strong password
   - **Alias**: `yogicmile`
   - **Alias password**: Create a strong password
   - **Validity**: 25 years
   - **Certificate details**: Fill your app details

#### B. Build Signed APK
1. Select your keystore file
2. Enter passwords
3. Select **release** build variant
4. Choose **V1 and V2** signature versions
5. Click **Finish**

### 4. Alternative: Command Line Build
```bash
# Navigate to android directory
cd android

# Build release APK
./gradlew assembleRelease

# The APK will be in: android/app/build/outputs/apk/release/
```

## Testing Checklist

### Before Installing APK:
- [ ] Verify app has internet permissions
- [ ] Check location permissions are requested
- [ ] Ensure notification permissions work

### After Installing APK:
- [ ] App launches without errors
- [ ] Registration/signup works
- [ ] Login with existing account works
- [ ] Step tracking functions
- [ ] Supabase data sync works
- [ ] Offline functionality works
- [ ] Push notifications work (if implemented)

## Troubleshooting

### APK Shows Static Content
- Ensure `dist/` folder contains all built files
- Check `capacitor.config.ts` doesn't point to development server
- Verify `npm run build` completed successfully

### Supabase Connection Issues
- Check network permissions in `android/app/src/main/AndroidManifest.xml`
- Verify HTTPS certificates are trusted
- Test on device with internet connection

### App Crashes on Launch
- Check Android Studio Logcat for errors
- Verify minimum SDK version compatibility
- Check for missing permissions

## Network Security Config

Ensure `android/app/src/main/res/xml/network_security_config.xml` exists:

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
        <domain includeSubdomains="true">10.0.3.2</domain>
    </domain-config>
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system"/>
        </trust-anchors>
    </base-config>
</network-security-config>
```

## Final Steps
1. Test the signed APK on multiple devices
2. Verify all Supabase features work offline/online
3. Upload to Google Play Console for distribution