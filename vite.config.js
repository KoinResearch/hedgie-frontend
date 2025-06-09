import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode, command }) => {
  const env = process.env;
  return {
    plugins: [react()],
    server: {
      port: parseInt(env.FRONTEND_PORT || '5173'),
      host: '0.0.0.0',
      allowedHosts: ['shoes-gmc-camcorders-trial.trycloudflare.com'],
      proxy: {
        '/api': 'http://localhost:5000',
      },
    },
    preview: {
      port: parseInt(env.FRONTEND_PORT || '5173'),
      host: '0.0.0.0'
    },
  };
});
