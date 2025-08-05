import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0',
        allowedHosts: ['.kavia.ai'],
        port: 3000,
        strictPort: true,
        cors: true,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        watch: {
            usePolling: true
        }
    }
})
