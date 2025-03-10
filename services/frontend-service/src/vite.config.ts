import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: path.resolve(__dirname, 'src'),
  build: {
    outDir: path.resolve(__dirname, 'dist'),
  },
  server: {
    port: 3000,
  },
  optimizeDeps: {
    include: ['src/app.ts'],
  },
});