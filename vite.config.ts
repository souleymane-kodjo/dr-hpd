import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimisations pour le déploiement
    rollupOptions: {
      output: {
        manualChunks: {
          // Séparer les vendors pour un meilleur cache
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          router: ['react-router-dom'],
        },
      },
    },
    // Réduire la taille des chunks
    chunkSizeWarningLimit: 600,
  },
  // Configuration pour le développement
  server: {
    port: 5173,
    host: '0.0.0.0', // Allow external connections (needed for Docker)
    open: false, // Don't try to open browser in Docker
  },
  // Résolution des paths
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
