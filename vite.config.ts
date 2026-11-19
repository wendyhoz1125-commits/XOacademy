import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves the site under /XOacademy/; the deploy workflow sets BASE_PATH. Locally it stays at /.
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  // Lets the dev server be shared through VS Code port forwarding (Dev Tunnels).
  server: {
    allowedHosts: ['.devtunnels.ms'],
  },
})
