import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Built site is served by GitHub Pages at https://lankyfranky89.github.io/Swell/
export default defineConfig({
  root: 'src',
  base: '/Swell/',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    // LG webOS 23 runs Chromium 94.
    target: 'chrome94',
    rollupOptions: {
      input: {
        main: resolve('src/index.html'),
        callback: resolve('src/callback/index.html'),
      },
    },
  },
});
