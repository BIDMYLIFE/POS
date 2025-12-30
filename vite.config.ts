import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/pos': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false
            },
            '/products': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false
            }
        }
    }
});
