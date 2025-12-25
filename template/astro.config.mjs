// @ts-check
import angular from '@analogjs/astro-angular';
import react from '@astrojs/react';
import vue from '@astrojs/vue';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  integrations: [angular(), react(), vue()],
  build: {
        inlineStylesheets: 'always'
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules') || id.includes('src')) {
              return 'app.js';
            }
            return 'app.js';
          },
          entryFileNames: `[name]_[hash].js`,
          chunkFileNames: `[name]_[hash].js`,
          assetFileNames: `assets/[name]_[hash].[ext]`,
        },
      },
    },
  },
});