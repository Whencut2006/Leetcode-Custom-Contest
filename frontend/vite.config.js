import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import basicSsl from '@vitejs/plugin-basic-ssl'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    basicSsl(),
    tailwindcss()
  ],
  base: './',

  build: {
    outDir: path.resolve(
      __dirname,
      '../extension/ui'
    ),
    emptyOutDir: true
  }
})
