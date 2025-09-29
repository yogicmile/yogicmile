# Build APK Instructions for Yogic Mile Fitness App

## Prerequisites
1. Android Studio installed
2. Java Development Kit (JDK) 11 or higher  
3. Android SDK with API level 33+
4. Git (to clone from GitHub)

## Step 1: Export to GitHub & Clone
1. In Lovable, click **GitHub** → **Export to GitHub** 
2. Clone your GitHub repository locally:
   ```bash
   git clone [your-github-repo-url]
   cd yogicmile
   ```

## Step 2: Install Dependencies & Build
```bash
# Install dependencies
npm install

# Add Android platform
npx cap add android

# Build for production
npm run build:android
```

## Step 3: Open in Android Studio
```bash
npx cap open android
```

## Step 4: Generate Signed APK

### Create Keystore (First Time Only)
1. In Android Studio: **Build** → **Generate Signed Bundle/APK**
2. Select **APK** → **Next**
3. Click **Create new...** keystore
4. Fill keystore details:
   - **Path**: `./android/yogicmile.keystore`
   - **Password**: [secure password]
   - **Alias**: `yogicmile`
   - **Validity**: 25 years

### Build Signed APK
1. Select your keystore file
2. Enter passwords
3. Choose **release** build variant
4. Select **V1 and V2** signature versions
5. Click **Finish**

## Step 5: Install & Test APK

### Install on Device
```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

### Test Checklist
- [ ] App launches without errors
- [ ] Registration/signup works with Supabase
- [ ] Login with existing account works
- [ ] Step tracking functions
- [ ] Account updates sync to Supabase
- [ ] All fitness features work offline/online

## Troubleshooting

### APK Shows Blank/Static Content
- Ensure you ran `npm run build:android` 
- Check `capacitor.config.ts` points to correct URL
- Verify Supabase connection is working

### Supabase Connection Issues  
- Check network permissions in `AndroidManifest.xml`
- Verify HTTPS certificates are trusted
- Test with actual internet connection

### Network Security
Add to `android/app/src/main/res/xml/network_security_config.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system"/>
        </trust-anchors>
    </base-config>
</network-security-config>
```

## Final Production APK

Your signed APK will be located at:
`android/app/build/outputs/apk/release/app-release.apk`

This APK will:
✅ Load live content from https://yogicmile.com
✅ Connect to Supabase for signup/signin
✅ Track steps and sync data
✅ Work as a production-ready fitness app

Ready for Google Play Store submission!