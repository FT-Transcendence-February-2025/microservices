import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const resolvedHost = '0.0.0.0'; // Bind to all interfaces
  const viteHost = env.VITE_HOST?.toLowerCase() || 'localhost'; // Convert VITE_HOST to lowercase
  console.log(`Resolved host: ${resolvedHost}`);
  console.log(`VITE_HOST (lowercase): ${viteHost}`);
  return defineConfig({
    plugins: [tailwindcss()],
    server: {
      host: resolvedHost,
      port: parseInt(env.VITE_PORT) || 3000,
      allowedHosts: [viteHost, '127.0.0.1', 'localhost', '0.0.0.0'] // Allow the lowercase host and defaults
    },
    preview: {
      host: resolvedHost,
      port: parseInt(env.VITE_PORT) || 3000,
      allowedHosts: [viteHost, '127.0.0.1', 'localhost', '0.0.0.0'] // Allow the lowercase host and defaults
    }
  })
}
