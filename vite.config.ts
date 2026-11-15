/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src')
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(import.meta.dirname, 'lumina-app.html')
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/@firebase/firestore')) {
            return 'firebase-firestore';
          }
          if (id.includes('node_modules/@firebase/auth')) {
            return 'firebase-auth';
          }
          if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) {
            return 'firebase-core';
          }
          if (id.includes('node_modules/vue') || id.includes('node_modules/pinia')) {
            return 'vue-vendor';
          }
        }
      }
    },
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: true
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['src/**/*.{test,spec}.{js,ts}']
  },
  server: {
    port: 3000,
    open: false
  }
});
