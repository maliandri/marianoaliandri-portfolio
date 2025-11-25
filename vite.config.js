import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import prerender from 'vite-plugin-prerender';

export default defineConfig({
  plugins: [
    react(),
    prerender({
      // The staticDir is no longer needed. It defaults to the correct 'dist' folder.
      routes: ['/'],
      rendererOptions: {
        renderAfterElementExists: '#root',
      }
    }),
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});

