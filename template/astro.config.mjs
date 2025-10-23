// @ts-check
import react from '@astrojs/react';
import { defineConfig } from 'astro/config';


// https://astro.build/config
export default defineConfig({
  integrations: [react()],
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
          entryFileNames: `[name].js`,
          chunkFileNames: `[name].js`,
          assetFileNames: `assets/[name].[ext]`,
        },
      },
    },
  },
});
