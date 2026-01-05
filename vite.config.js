import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
// eslint-disable-next-line no-unused-vars
import tailwindcss from '@tailwindcss/vite' // <-- Pastikan baris ini ada


// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
  base: '/catatan-EK/',
})

