import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor is configured but not yet initialised — no `android/` folder is
 * generated until we run `npx cap add android` in the packaging step.
 *
 * Launcher icons and splash screens are generated from `assets/` by
 * `npm run brand:native` (@capacitor/assets), which writes into the native
 * project once it exists.
 */
const config: CapacitorConfig = {
  appId: 'com.atronz.pethealth',
  appName: 'Atronz Pet Health',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
    // Matches the cream page background so there is no white flash between the
    // native splash and the web view painting.
    backgroundColor: '#FAF8F4',
  },
  server: {
    androidScheme: 'https',
  },
};

export default config;
