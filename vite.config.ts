import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Inline assets up to 16KB as base64 to remove extra HTTP requests for small option images
    assetsInlineLimit: 16 * 1024,
    rollupOptions: {
      output: {
        // Group all question images into a single asset folder with hashed names for long-term caching
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || '';
          if (/\.(jpe?g|png|webp|gif|svg)$/i.test(name)) {
            return 'assets/img/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
}));
