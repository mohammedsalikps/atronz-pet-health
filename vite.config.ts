import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  /**
   * The build uses a relative base so `dist/` works when Capacitor serves it
   * from the Android WebView's filesystem. Dev must stay on '/' — a relative
   * base breaks Vite's module transform middleware.
   */
  base: command === 'build' ? './' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: true,
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
}));
