import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const API_PORT = process.env.VITE_API_PORT ?? '5555';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: `http://127.0.0.1:${API_PORT}`,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'build',
  },
});
