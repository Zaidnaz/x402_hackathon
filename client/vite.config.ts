import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          algorand: ['algosdk', '@perawallet/connect'],
          icons: ['lucide-react']
        }
      }
    }
  },
  server: {
    host: true, // Exposes server to local network for mobile phone testing (e.g. http://192.168.x.x:5173)
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
});
