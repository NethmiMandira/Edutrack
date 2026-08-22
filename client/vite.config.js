import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    cssMinify: false, // Prevents esbuild missing package errors on CI/Hostinger
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('react-icons') || id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            return 'vendor';
          }
        },
      },
    },
  },
});