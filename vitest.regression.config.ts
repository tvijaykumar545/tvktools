import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

/**
 * Config used only by the backend regression suite. Unlike the default config,
 * it INCLUDES `src/test/backend-tools.regression.test.ts`, runs tests serially
 * (to keep AI-gateway usage predictable), and gives each test a generous
 * timeout because every assertion talks to a deployed edge function.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    globals: true,
    include: ["src/test/backend-tools.regression.test.ts"],
    fileParallelism: false,
    testTimeout: 90_000,
    hookTimeout: 30_000,
    pool: "forks",
    poolOptions: { forks: { singleFork: true } },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
