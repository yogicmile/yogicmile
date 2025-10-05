# iOS HealthKit Setup

## Required Steps:

### 1. Update Info.plist
Add to `ios/App/App/Info.plist`:

```xml
<key>NSHealthShareUsageDescription</key>
<string>We need access to your step data to track your daily walking and reward you with coins</string>
<key>NSHealthUpdateUsageDescription</key>
<string>We sync your walking progress to earn rewards</string>
```

### 2. Enable HealthKit Capability
In Xcode:
1. Open `ios/App/App.xcworkspace`
2. Select your app target
3. Go to "Signing & Capabilities"
4. Click "+ Capability"
5. Add "HealthKit"

### 3. Sync Capacitor
```bash
npx cap sync ios
```

### 4. Build and Run
```bash
npx cap open ios
```

Then build and run from Xcode.

## Testing on Device:
- HealthKit only works on physical devices
- Simulators will return mock data
- Ensure Health app has step data

## Data Sources:
- iPhone built-in pedometer
- Apple Watch
- Third-party fitness apps that write to Health
