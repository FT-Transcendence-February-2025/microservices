import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: path.resolve(__dirname, 'public'),
  build: {
    outDir: path.resolve(__dirname, 'dist'),
  },
  server: {
    port: 3000,
	host: '0.0.0.0',
  },
  optimizeDeps: {
    include: ['src/app.ts'],
  },
});