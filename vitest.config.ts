import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "node",
        globals: false,
        include: ["test/**/*.test.ts"],
        // Functional tests hit the live API and have their own config/runner.
        exclude: ["test/functional/**", "node_modules/**"],
        setupFiles: ["test/setup.ts"],
    },
});
