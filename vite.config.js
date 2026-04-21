import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/ActasUATP/', // <--- AGREGA ESTA LÍNEA (con el nombre exacto de tu repositorio)
})
