import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  build: {
    // Optimizaciones de producción
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Eliminar console.logs en producción
        drop_debugger: true,
      },
    },
    // Code splitting para reducir bundle size
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'framer-motion': ['framer-motion'],
          'chart-vendor': ['recharts'],
          'firebase': ['firebase/app', 'firebase/firestore'],
        },
      },
    },
    // Optimizaciones adicionales
    chunkSizeWarningLimit: 500,
    sourcemap: false, // Desactivar sourcemaps en producción para reducir tamaño
  },
});

