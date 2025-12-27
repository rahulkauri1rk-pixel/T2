import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // The third parameter '' ensures we load all env vars, not just VITE_ ones, 
  // though for client safety we only expose specific ones below.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
    },
    define: {
      // This ensures 'process.env.API_KEY' used in AIAssistant.tsx is replaced 
      // with the actual value from Vercel environment variables during build.
      'process.env.API_KEY': JSON.stringify(env.VITE_GOOGLE_API_KEY || process.env.VITE_GOOGLE_API_KEY),
    },
  };
});