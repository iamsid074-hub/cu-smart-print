import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cubazzar.app',
  appName: 'CU Bazzar',
  webDir: 'dist',
  server: {
    url: 'https://cubazzar.shop',
    cleartext: true
  }
};

export default config;
