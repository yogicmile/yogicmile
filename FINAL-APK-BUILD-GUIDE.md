# ✅ Final Working APK Build Guide

## 🔧 What Was Fixed

### 1. **Authentication Deep Links** ✅
- **Fixed**: `signUpMobile()` now uses native deep link (`yogicmile://auth-callback`) instead of web URL
- **Added**: Universal auth redirect handler at `/auth/redirect` to intercept magic links
- **Result**: Email verification links now correctly open the app on mobile devices

### 2. **Native Plugin Registration** ✅
- **Created**: `MainActivity.kt` with `BackgroundStepTrackingPlugin` registration
- **Result**: Eliminates "plugin is not implemented" errors

### 3. **Step Counter Baseline** ✅
- **Fixed**: StepCounterService now initializes baseline to current sensor value on first run
- **Result**: Fresh installs start at 0 steps instead of showing random cumulative values

---

## 📋 Pre-Build Checklist

### ✅ Supabase Dashboard Settings (Critical!)
1. **Site URL**: `yogicmile://auth-callback` (no typos!)
2. **Redirect URLs** (one per line):
   ```
   yogicmile://auth-callback
   http://localhost:3000
   http://localhost:3000/auth/redirect
   https://4741923f-866e-4468-918a-6e7c1c4ebf2e.lovableproject.com
   https://4741923f-866e-4468-918a-6e7c1c4ebf2e.lovableproject.com/auth/redirect
   https://preview--yogicmile.lovable.app
   https://preview--yogicmile.lovable.app/auth/redirect
   ```
3. **Save** and wait 30 seconds for propagation

---

## 🚀 Clean Build Script (Windows .bat)

Save this as `build-apk-clean.bat`:

```batch
@echo off
setlocal

echo =============================================
echo YogicMile - Final Production APK Build
echo =============================================

REM 0) Set Java
set JAVA_HOME=C:\Program Files\Microsoft\jdk-21.0.8.9-hotspot
set PATH=%JAVA_HOME%\bin;%PATH%

REM 1) Navigate to project
cd /d D:\YogicMile
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Could not find project directory
    pause
    exit /b 1
)

REM 2) Git pull latest
echo.
echo [Step 1/6] Pulling latest code...
git pull origin main
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Git pull failed. Continuing with local code...
)

REM 3) Fresh install
echo.
echo [Step 2/6] Installing dependencies...
if exist node_modules\.vite (
    rmdir /s /q node_modules\.vite
)
npm ci
if %ERRORLEVEL% NEQ 0 (
    echo Fallback: npm install --legacy-peer-deps
    npm install --legacy-peer-deps
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: npm install failed
        pause
        exit /b 1
    )
)

REM 4) Build frontend
echo.
echo [Step 3/6] Building frontend...
npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

REM 5) Sync Capacitor
echo.
echo [Step 4/6] Syncing Capacitor...
npx cap sync android
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Capacitor sync failed
    pause
    exit /b 1
)

REM 6) Clean Gradle
echo.
echo [Step 5/6] Cleaning Gradle build...
cd android
call gradlew.bat clean --no-daemon --warning-mode all
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Gradle clean failed
    pause
    exit /b 1
)

REM 7) Build debug APK
echo.
echo [Step 6/6] Building APK...
call gradlew.bat assembleDebug --no-daemon --warning-mode all
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: APK build failed
    pause
    exit /b 1
)

echo.
echo =============================================
echo ✅ SUCCESS! APK Location:
echo %CD%\app\build\outputs\apk\debug\app-debug.apk
echo =============================================
pause
```

**Run it:**
```cmd
build-apk-clean.bat
```

---

## 📱 Installation & Testing Workflow

### Step 1: Uninstall Previous Build
```bash
# Critical: Removes old deep link handlers and cached data
adb uninstall app.lovable.yogicmile
```

### Step 2: Install Fresh APK
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Step 3: Test Authentication Flow

#### A) Email/Password Signup
1. Open app → Signup
2. Fill form, choose "Email & Password"
3. Submit → Check email on the **same device**
4. Tap verification link in email
5. ✅ **Expected**: App opens via `yogicmile://auth-callback` and you're logged in
6. ❌ **If browser opens**: Check Supabase Site URL for typos

#### B) OTP Login
1. Open app → Login with OTP
2. Enter mobile number → Request OTP
3. Enter 6-digit code → Verify
4. ✅ **Expected**: Magic link opens app and you're logged in
5. ❌ **If stuck**: Check Logcat for `Deep link received:` logs

### Step 4: Verify Step Tracking

1. **First Launch**:
   - Tap "Allow Step Tracking"
   - Grant "Physical activity" permission
   - ✅ Steps should start at **0**

2. **Walk Test**:
   - Walk 20-30 steps
   - Open app → Steps should increase

3. **Notification**:
   - Pull down notification shade
   - ✅ Should see: "0 steps today • Tracking steps..."

4. **Reboot Test**:
   - Restart device
   - Open app
   - ✅ Service should restart (check notification)

---

## 🐛 Troubleshooting

### Problem: "Plugin is not implemented"
**Cause**: MainActivity not registered  
**Fix**: Verify `MainActivity.kt` exists at:
```
android/app/src/main/java/app/lovable/yogicmile/MainActivity.kt
```
Run: `npx cap sync android`

---

### Problem: Auth Links Open Browser Instead of App
**Causes**:
1. Site URL typo in Supabase (check for `yogicmile://auth-callbacl` vs `yogicmile://auth-callback`)
2. Deep link intent filter missing in `AndroidManifest.xml`
3. Old APK version installed

**Fix**:
```bash
# 1. Verify Supabase URLs (no typos!)
# 2. Check AndroidManifest.xml has:
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="yogicmile" android:host="auth-callback" />
</intent-filter>

# 3. Uninstall & reinstall:
adb uninstall app.lovable.yogicmile
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

**Verify in Logcat**:
```bash
adb logcat | grep "Deep link"
# Should see: "Deep link received: yogicmile://auth-callback#access_token=..."
```

---

### Problem: Random Steps on Fresh Install
**Cause**: Old baseline logic  
**Fix**: Already fixed in `StepCounterService.kt` (initializes baseline to current sensor value)

**Verify**:
```bash
# Uninstall completely
adb uninstall app.lovable.yogicmile

# Reinstall
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Open app → Steps should be 0
```

---

### Problem: Permission Denied / Service Stops
**Causes**:
1. "Physical activity" permission not granted
2. OEM battery optimization killing service

**Fix**:
```bash
# 1. Manual permission grant (if prompt doesn't appear):
Settings → Apps → YogicMile → Permissions → Physical activity → Allow

# 2. OEM battery optimization:
# Xiaomi/Redmi:
Settings → Battery → App battery saver → YogicMile → No restrictions

# Realme/Vivo/OnePlus:
Settings → Battery → More Settings → Battery optimization → YogicMile → Don't optimize
```

---

## 📊 Logcat Debugging Commands

### View All App Logs
```bash
adb logcat | grep -i yogicmile
```

### Auth Deep Link Logs
```bash
adb logcat | grep "Deep link"
```

### Step Tracking Logs
```bash
adb logcat | grep "StepCounter"
```

### Clear Logcat & Monitor Fresh
```bash
adb logcat -c
adb logcat | grep -E "(yogicmile|StepCounter|Deep link)"
```

---

## ✅ Final Validation Checklist

- [ ] Supabase Site URL: `yogicmile://auth-callback` (no typos)
- [ ] Supabase Redirect URLs include all 4 URLs
- [ ] Old APK uninstalled before testing
- [ ] Email verification link opens app (not browser)
- [ ] OTP login redirects to app
- [ ] Fresh install shows 0 steps
- [ ] Steps increase when walking
- [ ] Notification shows step count
- [ ] Service restarts after device reboot
- [ ] No "plugin not implemented" errors in Logcat

---

## 🎯 Production Release Checklist

1. **Remove Debug Features**:
   - Remove console.log statements
   - Disable test/dev buttons

2. **Update Version**:
   - Edit `android/app/build.gradle`:
     ```gradle
     versionCode 2
     versionName "1.0.1"
     ```

3. **Build Release APK**:
   ```bash
   cd android
   gradlew.bat assembleRelease
   ```

4. **Sign APK**:
   - Use Android Studio: Build → Generate Signed Bundle/APK
   - Or use `jarsigner` command-line tool

5. **Test Signed APK**:
   ```bash
   adb install android/app/build/outputs/apk/release/app-release.apk
   ```

6. **Upload to Play Store**:
   - Google Play Console → Create Release
   - Upload signed APK
   - Fill store listing, screenshots
   - Submit for review

---

## 📞 Support

If issues persist after following this guide:

1. **Capture logs**:
   ```bash
   adb logcat > full_logcat.txt
   ```

2. **Share**:
   - Full logcat.txt
   - Screenshot of Supabase URL Configuration
   - Screenshot of error in app

3. **Common Solutions**:
   - Always uninstall old APK before testing
   - Wait 30s after Supabase config changes
   - Restart device if deep links aren't working
   - Check manufacturer battery settings for aggressive OEMs

---

**Last Updated**: After fixing auth redirects, MainActivity plugin registration, and step baseline initialization.
