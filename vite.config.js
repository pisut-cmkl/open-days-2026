import { defineConfig } from 'vite';

// Relative base works for local preview and GitHub project pages.
export default defineConfig({
  base: './',
  server: {
    port: 5173,
    open: false,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
