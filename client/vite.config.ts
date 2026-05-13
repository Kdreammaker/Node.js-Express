import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    proxy: {
      '/performances': 'http://localhost:3001',
      '/bookings':     'http://localhost:3001',
      '/users':        'http://localhost:3001',
    },
  },
});
