# Android Step Tracking Testing Guide

## ⚠️ Important: Web Preview Limitations

**Native Android features CANNOT be tested in the web browser preview.** The following features require a physical Android device or emulator:

- ✗ Hardware step counter (TYPE_STEP_COUNTER)
- ✗ Google Fit integration
- ✗ Background foreground service
- ✗ Battery optimization settings
- ✗ Native permissions (Activity Recognition, etc.)
- ✗ GPS/Location tracking
- ✗ Haptic feedback
- ✗ Local notifications

## 📱 Build APK for Testing

### Step 1: Export to GitHub
1. Click "Export to GitHub" button in Lovable
2. Clone the repository to your local machine

### Step 2: Install Dependencies
```bash
cd your-project-directory
npm install
```

### Step 3: Add Android Platform
```bash
npx cap add android
```

### Step 4: Build the Project
```bash
npm run build
npx cap sync
```

### Step 5: Open in Android Studio
```bash
npx cap open android
```

### Step 6: Build APK
In Android Studio:
1. Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**
2. Wait for build to complete
3. APK will be located at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Step 7: Install on Device
```bash
# Connect device via USB with USB debugging enabled
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## 🧪 Testing Checklist

Once the APK is installed on your physical Android device, use the **Step Tracking Validator** component on the dashboard to verify:

### ✅ System Checks

1. **Platform Detection**
   - Should show "Running on Android device"
   - ❌ If shows "web browser" → Not on device yet

2. **Step Tracking Active**
   - Should show "Background tracking is active"
   - ✓ Check notification bar for "YogicMile - Step Tracking Active"
   - ❌ If inactive → Check permissions below

3. **Permissions Granted**
   - ✓ Location permission granted
   - ✓ Notifications permission granted
   - ✓ Motion/Activity permission granted
   - ❌ If any missing → App will prompt on launch

4. **GPS Accuracy**
   - Should show accuracy < 50m for "High accuracy"
   - 🟡 50-100m = "Medium accuracy" (acceptable)
   - ❌ > 100m = "Low accuracy" (may affect validation)

5. **Speed Validation**
   - Should stay < 12 km/h during walking
   - ❌ If exceeds → Steps may not be counted (anti-cheat)

6. **Battery Optimization**
   - Should show "Battery optimization configured"
   - ✓ Check if exemption granted
   - ❌ If not configured → Background tracking may stop

7. **Data Sync**
   - Should show "Last sync: Just now" or "< 2m ago"
   - ❌ If > 5m ago → Sync may have issues

8. **Google Fit Connection** (Android only)
   - 🟢 "Connected" → Best option (most accurate)
   - 🟡 "Not connected" → Still works with hardware sensor
   - Manual sync available via button

## 📊 Validation Dashboard

The **Step Tracking Validator** shows:

### Health Score (0-100%)
- **100%** = All systems operational ✅
- **60-99%** = Mostly working, minor issues 🟡
- **< 60%** = Critical issues, needs fixing ❌

### Real-Time Stats
- Today's Steps (from hardware sensor)
- Lifetime Steps (cumulative)
- Google Fit Steps (if connected)
- Last Sync Time

### Refresh Button
- Triggers manual validation check
- Forces Google Fit sync (if available)
- Updates all metrics

## 🔧 Troubleshooting by Device Brand

### Xiaomi (MIUI)
If background tracking stops:
1. Go to **Settings > Apps > YogicMile**
2. **Battery Saver** → No restrictions
3. **Autostart** → Enable
4. **Display pop-up windows while running in background** → Enable

### Oppo/Realme (ColorOS)
1. **Settings > Battery > App Battery Management**
2. Find YogicMile → Don't optimize
3. **Settings > Privacy > Permission Manager > Autostart**
4. Enable YogicMile

### OnePlus (OxygenOS)
1. **Settings > Battery > Battery Optimization**
2. YogicMile → Don't optimize
3. **Settings > Apps > YogicMile > Battery**
4. Optimize battery usage → OFF

### Samsung (One UI)
1. **Settings > Apps > YogicMile**
2. **Battery** → Unrestricted
3. **Permissions** → Allow all
4. **Remove from Sleeping apps** if present

### Vivo (Funtouch OS)
1. **Settings > Battery > Background power consumption management**
2. YogicMile → High background power consumption
3. **Settings > More Settings > Permission Manager**
4. Enable all permissions

## 🚶 Physical Testing Process

### Test 1: Step Detection (5 minutes)
1. Open app, note current step count
2. Walk normally for 100 steps (count manually)
3. Check if app shows ~100 new steps
4. ✅ Pass if within ±10 steps
5. ❌ Fail if no change or wildly inaccurate

### Test 2: Background Tracking (15 minutes)
1. Note current step count
2. Lock phone screen
3. Walk for 200 steps
4. Unlock phone, open app
5. ✅ Pass if steps updated
6. ❌ Fail if no change

### Test 3: App Minimized (15 minutes)
1. Note current step count
2. Go to home screen (app in background)
3. Walk for 200 steps
4. Return to app
5. ✅ Pass if steps updated
6. ❌ Fail if no change

### Test 4: Google Fit Sync (5 minutes)
1. Open Google Fit app
2. Walk 100 steps in Google Fit
3. Return to YogicMile
4. Tap refresh on validator
5. ✅ Pass if Google Fit steps merge
6. ❌ Fail if no sync

### Test 5: Speed Validation (5 minutes)
1. Walk normally (< 12 km/h)
2. Check validator shows "Valid speed"
3. Try running (> 12 km/h)
4. ✅ Pass if app shows "Speed too high" warning
5. Steps should NOT count while running

### Test 6: Overnight Test (12 hours)
1. Leave app running overnight
2. Check next morning if:
   - Notification still present
   - Step count accurate
   - Battery drain < 5%
3. ✅ Pass if all conditions met

## 📈 Expected Accuracy Levels

| Scenario | Expected Accuracy | Acceptable Range |
|----------|-------------------|------------------|
| Walking (hardware sensor) | 95-100% | ±5% |
| Walking (Google Fit) | 90-100% | ±10% |
| Background tracking | 90-95% | ±10% |
| App minimized | 85-95% | ±15% |
| Screen off | 80-90% | ±20% |

## ⚡ Performance Benchmarks

| Metric | Target | Acceptable |
|--------|--------|------------|
| Battery drain (24h) | < 3% | < 5% |
| Data sync delay | < 30s | < 2min |
| GPS accuracy | < 30m | < 50m |
| Step detection latency | < 5s | < 10s |

## 🐛 Common Issues & Fixes

### Issue: Steps not counting
**Fix:**
1. Check validator shows all green
2. Verify permissions granted
3. Restart app
4. If persistent, reinstall APK

### Issue: Background tracking stops
**Fix:**
1. Check battery optimization disabled
2. Enable autostart for your device brand
3. Keep notification visible
4. Don't force-close app from recent apps

### Issue: Google Fit not syncing
**Fix:**
1. Verify Google Play Services installed
2. Check internet connection
3. Manually trigger sync via refresh button
4. Re-grant Google Fit permissions

### Issue: High battery drain
**Fix:**
1. Check GPS isn't set to "High accuracy" mode
2. Reduce sync frequency if possible
3. Ensure app uses hardware sensor (not GPS polling)

### Issue: Inaccurate step counts
**Fix:**
1. Calibrate by walking known distance
2. Compare with Google Fit
3. Check GPS accuracy in validator
4. Walk normally (don't shuffle or run)

## 📝 Testing Report Template

Use this template to document your testing:

```
Device: [Brand & Model]
Android Version: [e.g., Android 13]
Date: [Test Date]

VALIDATION SCORE: [____%]

SYSTEM CHECKS:
☐ Platform: Android
☐ Tracking Active: Yes/No
☐ Permissions: All granted
☐ GPS Accuracy: [___m]
☐ Speed Valid: Yes/No
☐ Battery Optimized: Yes/No
☐ Data Sync: [___ mins ago]
☐ Google Fit: Connected/Disconnected

PHYSICAL TESTS:
☐ Step Detection: Pass/Fail ([Actual] vs [Expected] steps)
☐ Background Tracking: Pass/Fail
☐ App Minimized: Pass/Fail
☐ Google Fit Sync: Pass/Fail
☐ Speed Validation: Pass/Fail

PERFORMANCE:
- Battery drain (24h): [____%]
- Step accuracy: [____%]
- Sync delay: [___s]

ISSUES FOUND:
1. [List any issues]
2. ...

DEVICE-SPECIFIC NOTES:
[Any brand-specific behavior or setup needed]
```

## 🎯 Success Criteria

Your Android step tracking is **production-ready** when:

✅ Validation score ≥ 80%
✅ All 6 physical tests pass
✅ Battery drain < 5% per 24h
✅ Step accuracy ≥ 85%
✅ Background tracking works for 12+ hours
✅ Works on at least 3 different Android brands

## 🔄 Next Steps After Testing

1. ✅ If all tests pass → Ready for production APK build
2. 🟡 If 80-90% pass → Minor fixes needed, acceptable for beta
3. ❌ If < 80% pass → Major issues, need native plugin fixes

## 📞 Support & Resources

- **Android Step Tracking Docs**: See `android-build-instructions.md`
- **Device-Specific Notes**: See `android-device-specific-notes.md`
- **Native Implementation**: See `android-native-service-implementation.md`
- **Google Fit Setup**: See `android-google-fit-implementation.md`

---

**Remember:** Always test on a **physical device** with a **debug APK** before building for production!
