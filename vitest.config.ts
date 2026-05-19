import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    // Backend regression suite is network-bound and consumes AI credits.
    // Run it explicitly via `bun run test:backend-regression`.
    exclude: [
      "node_modules/**",
      "dist/**",
      "src/test/backend-tools.regression.test.ts",
    ],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
