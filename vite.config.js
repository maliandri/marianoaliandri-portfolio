import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import prerender from 'vite-plugin-prerender';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    prerender({
      staticDir: path.join(__dirname, 'dist'),
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

