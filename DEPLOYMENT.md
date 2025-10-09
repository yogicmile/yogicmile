# YogicMile Deployment Guide

## Overview
YogicMile uses a dual-deployment strategy:
- **Web Version**: Deployed to Netlify for browser access
- **Mobile Apps**: Built locally with bundled assets for app stores

## Prerequisites
- GitHub account connected to Lovable
- Netlify account
- Android Studio (for Android APK)
- Xcode (for iOS, Mac only)

## Web Deployment (Netlify)

### Initial Setup
1. Connect Lovable to GitHub (if not already done)
   - Click GitHub button in Lovable
   - Authorize and create repository

2. Connect GitHub to Netlify
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Select your YogicMile repository
   - Build settings are auto-detected from `netlify.toml`
   - Click "Deploy site"

3. Configure Custom Domain (Optional)
   - In Netlify: Site settings → Domain management
   - Add your custom domain
   - Update DNS records as instructed

### Automatic Updates
- Every push to GitHub automatically deploys to Netlify
- Changes in Lovable auto-sync to GitHub → triggers Netlify build

## Mobile App Deployment

### One-Time Setup
```bash
# Clone your repository
git clone https://github.com/YOUR_USERNAME/yogicmile.git
cd yogicmile

# Install dependencies
npm install

# Add native platforms (if not already added)
npx cap add android
npx cap add ios
```

### Building Production APK/IPA

#### For Every Release:

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install/update dependencies
npm install

# 3. Build web assets
npm run build

# 4. Sync to native projects
npx cap sync

# 5. Open in native IDE
npx cap open android  # for Android
npx cap open ios      # for iOS (Mac only)
```

#### In Android Studio:
1. Build → Generate Signed Bundle/APK
2. Select APK
3. Create/select keystore
4. Build release APK
5. Find APK in `android/app/build/outputs/apk/release/`

#### In Xcode (iOS):
1. Product → Archive
2. Distribute App
3. Follow App Store submission process

### Important Notes

**Production Configuration:**
- `capacitor.config.ts` is configured for bundled assets (offline support)
- Web assets are included in the APK/IPA
- No internet required for app to function (except API calls)

**Development Hot-Reload:**
If you need to test with live reload, temporarily add to `capacitor.config.ts`:
```typescript
server: { 
  url: 'https://yogicmile.netlify.app', 
  cleartext: true 
}
```
**Remove this before production builds!**

## Testing Strategy

### Web Version
- Test at: `https://your-app.netlify.app`
- Verify all features work in browser
- Check responsive design

### Mobile Version
- Test bundled APK on physical device
- Verify native features:
  - Step tracking
  - HealthKit integration
  - Push notifications
  - Offline functionality

## CI/CD (Optional Advanced Setup)

You can automate mobile builds using GitHub Actions or Fastlane, but manual building is recommended for initial releases.

## Troubleshooting

### Netlify Build Fails
- Check build logs in Netlify dashboard
- Verify `netlify.toml` configuration
- Ensure all dependencies in `package.json`

### APK Build Fails
- Run `npx cap sync` before opening Android Studio
- Clear build cache: Build → Clean Project
- Check `android/app/build.gradle` for errors

### Native Features Not Working
- Verify permissions in `capacitor.config.ts`
- Check Android: `AndroidManifest.xml`
- Check iOS: `Info.plist`

## Support Resources
- [Lovable Docs](https://docs.lovable.dev)
- [Capacitor Docs](https://capacitorjs.com)
- [Netlify Docs](https://docs.netlify.com)
