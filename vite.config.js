import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    solidPlugin(),
    tailwindcss(),
  ],
  server: {
    port: 5001,
    allowedHosts: ['enpcv.org', 'www.enpcv.org']
  },
  build: {
    target: 'esnext',
  },
  preview: {
    port: 5001,
  }
});
