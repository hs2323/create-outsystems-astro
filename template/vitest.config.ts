/// <reference types="vitest" />

import react from "@vitejs/plugin-react";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    /** TODO: Add Angular testing */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    react() as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vue() as any,
  ],
  test: {
    environment: "happy-dom",
    globals: true,
    include: ["test/unit/**/**.ts", "test/integration/**/**.tsx"],
    setupFiles: ["test/setup-test-env.ts"],
  },
});
