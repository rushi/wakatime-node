import { defineConfig } from "vitest/config";

// Live integration tests against the real WakaTime API. No MSW setup: these
// make real network calls, gated behind the WAKATIME_API_KEY env var.
export default defineConfig({
    test: {
        environment: "node",
        globals: false,
        include: ["test/functional/**/*.test.ts"],
        testTimeout: 30_000,
        hookTimeout: 30_000,
        // Requests share a rate limit; run serially to stay well under it.
        fileParallelism: false,
        retry: 1,
    },
});
