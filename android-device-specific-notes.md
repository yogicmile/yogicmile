# Android Device-Specific Configuration

## Overview
Different Android manufacturers implement custom OS layers (skins) that may affect background step tracking. This guide covers device-specific settings for reliable step tracking across all brands.

---

## Samsung Devices (One UI)

### Battery Optimization
**Settings → Apps → YogicMile → Battery → Battery optimization**
- Set to: **No restrictions**
- Alternative: Settings → Battery → Background usage limits → Never sleeping apps → Add YogicMile

### Background Data
**Settings → Apps → YogicMile → Mobile data**
- Enable: **Allow background data usage**
- Enable: **Allow data usage while Data saver is on**

### Adaptive Battery
**Settings → Battery → More battery settings → Adaptive battery**
- Disable for YogicMile

### Auto-start
**Settings → Apps → YogicMile → More options (⋮) → Auto-start**
- Enable auto-start

### Tested Models
- Galaxy S21, S22, S23, S24 series ✅
- Galaxy A series (A52, A53, A54) ✅
- Galaxy M series ✅

---

## OnePlus (OxygenOS / ColorOS)

### Battery Optimization
**Settings → Battery → Battery optimization → YogicMile**
- Set to: **Don't optimize**

### Background App Management
**Settings → Apps → YogicMile → Battery → Battery optimization**
- Set to: **Unrestricted**

### Auto-start
**Settings → Apps → YogicMile → Battery → Auto-launch**
- Enable auto-launch

### Recent Apps Lock
- Open recent apps (square button)
- Find YogicMile
- Pull down to lock (shows lock icon)

### Tested Models
- OnePlus 9, 10, 11 series ✅
- OnePlus Nord series ✅
- OnePlus 7T, 8T ✅

---

## Xiaomi/MI (MIUI / HyperOS)

### Battery Saver
**Settings → Apps → Manage apps → YogicMile → Battery saver**
- Set to: **No restrictions**

### Autostart
**Settings → Apps → Manage apps → YogicMile → Autostart**
- Enable autostart

### Battery Optimization
**Settings → Battery & performance → App battery saver → YogicMile**
- Set to: **No restrictions**

### Background Activity
**Settings → Apps → Manage apps → YogicMile → Other permissions**
- Enable: **Start in background**
- Enable: **Display pop-up windows while running in background**

### MIUI Optimization
**Settings → Additional settings → Developer options → MIUI optimization**
- Turn OFF for YogicMile

### Tested Models
- Redmi Note 10, 11, 12 series ✅
- POCO X3, X4, X5 series ✅
- Mi 11, 12, 13 series ✅

---

## Oppo (ColorOS)

### Background Freeze
**Settings → Battery → App Battery Management → YogicMile**
- Set to: **Allow background activity**

### Smart Power
**Settings → Battery → More → Smart Power Management**
- Exclude YogicMile

### Startup Manager
**Settings → Privacy → Startup Manager → YogicMile**
- Enable startup

### Recent Apps Lock
- Open recent apps
- Pull down YogicMile card to lock

### Tested Models
- Oppo Reno 8, 9, 10 series ✅
- Oppo A series (A78, A98) ✅
- Oppo Find X5, X6 ✅

---

## Vivo (FuntouchOS / OriginOS)

### Background Apps
**Settings → Battery → Background power consumption management → YogicMile**
- Set to: **Allow**

### Auto-start
**Settings → More settings → Applications → Autostart → YogicMile**
- Enable

### High Background Power Consumption
**Settings → Battery → High background power consumption → YogicMile**
- Enable

### Recent Apps Lock
- Open recent apps
- Long press YogicMile
- Select "Lock"

### Tested Models
- Vivo V25, V27, V29 series ✅
- Vivo Y series ✅
- Vivo X80, X90 ✅

---

## Realme (Realme UI)

### App Auto-start
**Settings → App Management → App list → YogicMile → App auto-launch**
- Enable

### Battery Optimization
**Settings → Battery → More battery settings → App quick freeze → YogicMile**
- Disable

### Background Restriction
**Settings → App Management → YogicMile → App battery usage**
- Set to: **Allow**

### Sleep Standby Optimization
**Settings → Battery → More battery settings → Sleep standby optimization**
- Exclude YogicMile

### Tested Models
- Realme GT series ✅
- Realme 10, 11, 12 series ✅
- Realme Narzo series ✅

---

## Motorola (Near-stock Android)

### Battery Optimization
**Settings → Apps → YogicMile → Advanced → Battery → Battery optimization**
- Set to: **Not optimized**

### Background Data
**Settings → Apps → YogicMile → Mobile data & Wi-Fi**
- Enable: **Background data**
- Enable: **Unrestricted data usage**

### Tested Models
- Motorola Edge 30, 40 series ✅
- Moto G series ✅

---

## Google Pixel (Stock Android)

### Battery Optimization
**Settings → Apps → YogicMile → Battery → Battery optimization**
- Set to: **Don't optimize**

### Background Data
**Settings → Apps → YogicMile → Data usage**
- Enable: **Background data**
- Disable: **Unrestricted data**

### Adaptive Battery
**Settings → Battery → Adaptive Battery**
- Works well with YogicMile
- No special configuration needed

### Tested Models
- Pixel 6, 7, 8 series ✅
- Pixel 6a, 7a, 8a ✅

---

## Universal Steps (All Devices)

### Check App Permissions
1. Open Settings → Apps → YogicMile → Permissions
2. Ensure granted:
   - **Location**: Allow all the time
   - **Physical activity**: Allow
   - **Notifications**: Allow
   - **Storage**: Allow (if prompted)

### Disable Battery Saver Mode
Battery saver modes can stop step tracking:
- Temporarily disable when starting a walk
- Or add YogicMile to exceptions

### Keep App in Recent Apps
- Don't swipe away YogicMile from recent apps
- Lock the app card if your device supports it

### Test Step Tracking
1. Open YogicMile
2. Take 50-100 steps
3. Check if step count updates within 1 minute
4. If not, revisit battery settings above

---

## Troubleshooting by Brand

### Samsung: Steps Not Updating
1. Disable "Put apps to sleep" for YogicMile
2. Add to "Never sleeping apps" list
3. Disable "Adaptive battery" temporarily

### OnePlus: Background Process Killed
1. Lock app in recent apps
2. Enable "Auto-launch"
3. Set battery optimization to "Unrestricted"

### Xiaomi/MI: Autostart Not Working
1. Enable "Autostart" permission
2. Disable "MIUI optimization" (Developer options)
3. Grant "Display pop-up" permission

### Oppo: App Freezes in Background
1. Disable "Smart Power Management"
2. Enable "Allow background activity"
3. Lock app in recent apps

### Vivo: GPS Not Working
1. Set location to "Allow all the time"
2. Enable "High background power consumption"
3. Disable power saving mode

### Realme: App Closes After 5 Minutes
1. Enable "App auto-launch"
2. Disable "App quick freeze"
3. Exclude from sleep standby optimization

---

## Developer Tips

### Testing on Specific Brands
```bash
# Check device manufacturer
adb shell getprop ro.product.manufacturer

# Check Android version
adb shell getprop ro.build.version.release

# Check if step counter sensor exists
adb shell dumpsys sensorservice | grep -i step

# Monitor sensor events
adb shell dumpsys sensorservice
```

### Common Sensor Names by Brand
- **Samsung**: "Samsung Step Counter Sensor"
- **OnePlus**: "OnePlus Step Counter"
- **Xiaomi**: "Xiaomi Step Counter" or "QTI Step Counter"
- **Oppo**: "OPPO Step Counter"
- **Vivo**: "VIVO Step Counter"
- **Realme**: "Realme Step Counter"
- **Google Pixel**: "Google Step Counter" or "Bosch Step Counter"

### Background Service Best Practices
1. Use foreground service with persistent notification
2. Implement doze mode exemptions
3. Handle manufacturer-specific power managers
4. Use JobScheduler for periodic sync
5. Implement wake locks carefully

---

## Feedback & Updates

If you encounter issues on a specific device model not listed here:
1. Note the device model and Android version
2. Document the exact settings that worked
3. Submit feedback through the app

This guide is regularly updated based on user feedback and new device releases.
