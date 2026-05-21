/// <reference types="node" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    const env = loadEnv(mode, process.cwd(), '');
    
    // Backend URL for dev proxy (only used in development)
    const backendUrl = env.VITE_DEV_BACKEND_URL || 'http://localhost:8000';
    
    return {
        plugins: [
            react(),
            svgr({
                svgrOptions: {
                    icon: true,
                    // This will transform your SVG to a React component
                    exportType: 'named',
                    namedExport: 'ReactComponent',
                },
            }),
        ],
        build: {
            rollupOptions: {
                output: {
                    manualChunks: {
                        // Vendor chunks for better caching
                        'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                        'vendor-charts': ['apexcharts', 'react-apexcharts'],
                        'vendor-utils': ['axios', 'clsx', 'tailwind-merge'],
                    },
                },
            },
            // Disable source maps in production for smaller builds
            sourcemap: false,
            // Use esbuild for faster minification
            minify: 'esbuild',
            // Target modern browsers for smaller bundle
            target: 'esnext',
            // Increase chunk size warning limit (charts are large)
            chunkSizeWarningLimit: 600,
        },
        // Optimize dependencies for faster dev and prod
        optimizeDeps: {
            include: ['react', 'react-dom', 'react-router-dom', 'axios'],
        },
        // Proxy API requests to Django backend in development
        // This makes requests same-origin, so cookies work without SameSite issues
        server: {
            port: 3000,
            proxy: {
                '/api': {
                    target: backendUrl,
                    changeOrigin: true,
                },
            },
        },
    };
});
