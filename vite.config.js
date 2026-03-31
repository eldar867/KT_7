import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true,
    port: 8080,
    watch: {
      usePolling: true,
      interval: 300,
      ignored: ['**/__fixtures__/**'],
    },
    proxy: {
      '/travels': 'http://localhost:3000',
    },
    fs: {
      allow: [
        resolve('public'),
        resolve('src'),
        resolve('.')],
    },
  },
  cacheDir: '/var/tmp/.vite',
});
