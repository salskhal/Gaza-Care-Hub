import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize for low-spec devices
    target: 'es2015', // Support older browsers/devices
    minify: 'terser', // Better compression than esbuild
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching and loading
        manualChunks: {
          // Vendor chunk for third-party libraries
          vendor: ['react', 'react-dom'],
          // Database chunk for storage-related code
          database: ['dexie'],
          // Utils chunk for utility functions
          utils: ['./src/lib/utils.ts', './src/lib/accessibility.ts'],
        },
        // Optimize chunk file names for caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Optimize bundle size
    chunkSizeWarningLimit: 1000, // Warn for chunks larger than 1MB
    // Enable source maps for debugging but optimize them
    sourcemap: false, // Disable in production for smaller bundle
  },
  // Optimize development server for low-spec devices
  server: {
    // Reduce memory usage during development
    hmr: {
      overlay: false, // Disable error overlay to reduce memory usage
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'dexie',
    ],
    // Exclude heavy dependencies that should be loaded on demand
    exclude: [],
  },
})