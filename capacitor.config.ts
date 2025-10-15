import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.4741923f866e4468918a6e7c1c4ebf2e',
  appName: 'yogicmile',
  webDir: 'dist',
  // Production: Web assets bundled in app for offline support
  // For development hot-reload, uncomment the server config below:
  // server: { url: 'https://4741923f-866e-4468-918a-6e7c1c4ebf2e.lovableproject.com?forceHideBadge=true', cleartext: true }
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#f5f5f5',
      showSpinner: false
    },
    StatusBar: {
      style: 'light'
    },
    Geolocation: {
      permissions: {
        location: "always"
      }
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav"
    },
    Preferences: {
      group: "YogicMileGroup"
    },
    Haptics: {
      enabled: true
    },
    App: {
      backgroundColor: "#f5f5f5"
    }
  }
};

export default config;
