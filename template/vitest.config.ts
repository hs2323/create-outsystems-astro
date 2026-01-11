/// <reference types="vitest" />
/// <reference types="vite/client" />

import react from "@vitejs/plugin-react";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    /** TODO: Add Angular testing */
    react(),
    vue(),
  ],
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["test/setup-test-env.ts"],
    include: ["test/unit/**/**.ts", "test/integration/**/**.tsx"],
  },
});
