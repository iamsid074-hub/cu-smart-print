import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cubazzar.app',
  appName: 'Cu Bazzar',
  webDir: 'dist',
  android: {
    backgroundColor: '#000000',
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    App: {
      // Capacitor handles the back button via JS listeners
    },
    Haptics: {
      // Enable haptic feedback
    },
  },
  server: {
    // In production the app loads from local dist/ assets
    // For development, uncomment below and set your local IP:
    // url: 'http://192.168.x.x:8080',
    // cleartext: true,
    androidScheme: 'https',
  },
};

export default config;
