// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
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
          assetFileNames: `[name].[ext]`,
        },
      },
    },
  },
});
