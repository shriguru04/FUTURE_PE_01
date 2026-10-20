import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development, /api requests are forwarded to the optional proxy (npm run server)
// so the AI provider key stays on the server and never enters the browser bundle.
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:8787' } },
});
