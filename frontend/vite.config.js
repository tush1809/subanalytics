import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_TARGET || 'http://localhost:5001',
          changeOrigin: true,
          // rewrite: (p) => p.replace(/^\/api/, ''), // enable if backend doesn't use /api
        },
      },
    },
  }
})
