import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@components": path.resolve(import.meta.dirname, "client/src/components"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
 build: {
   outDir: path.resolve(import.meta.dirname, "dist/public"),
   emptyOutDir: true,
   rollupOptions: {
     output: {
       manualChunks(id) {
         if (id.includes('node_modules')) {
           if (id.includes('@radix-ui')) {
             return 'radix-ui';
           } else if (id.includes('@tanstack')) {
             return 'tanstack';
           } else if (id.includes('react')) {
             return 'react';
           }
           return 'vendor';
         }
         return 'app';
       },
     },
   },
 },
});
