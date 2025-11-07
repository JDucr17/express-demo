import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["src/test/setup-db.ts"],
    coverage: {
      enabled: true,
      provider: "v8",
      reporter: ["text", "json", "html", "json-summary"],
      thresholds: {
        lines: 80,
      },
      include: [
        "src/modules/**/*.ts",
        "src/middleware/**/*.ts",
        "src/shared/errors/**/*.ts",
        "src/modules/**/controller.ts",
      ],
      exclude: [
        "src/modules/**/routes.ts",

        "src/modules/**/repository.ts",
        "src/modules/**/types.ts",
        "src/modules/**/__tests__/**",
        "**/*.test.ts",
        "**/*.spec.ts",
      ],
    },
  },
});
