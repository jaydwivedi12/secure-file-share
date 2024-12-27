// frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
      https: {
        key: path.resolve(__dirname, 'ssl/private.key'),  // Corrected path
        cert: path.resolve(__dirname, 'ssl/certificate.crt'),  // Corrected path
      },    
    port: 3000,
    proxy: {
        '/api': {
            target: 'https://localhost',
            changeOrigin: true,
            secure: false
        }
    }
}
});