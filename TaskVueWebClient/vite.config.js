import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// set port to 3000
export default defineConfig({
  plugins: [react()],
    server: {
        port: 3000

    }
})
