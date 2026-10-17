import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Files in public/ (photos, fonts, _headers, robots.txt) are copied to dist/
// unchanged, so /assets/images/* and /assets/fonts/* keep their URLs.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
