import { setDefaultResultOrder } from "node:dns";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

// Some sandboxes block IPv6-first egress, which makes Node hang until timeout
// while curl (IPv4) works. Prefer IPv4 so the live tests connect promptly.
// Test-runner only; does not affect the published SDK.
setDefaultResultOrder("ipv4first");

// Load .env.local into process.env so the live tests can read WAKATIME_API_KEY
// without the caller exporting it manually. Keys already in the environment win.
const loadEnvLocal = (): void => {
    const envPath = fileURLToPath(new URL(".env.local", import.meta.url));
    if (!existsSync(envPath)) {
        return;
    }
    for (const rawLine of readFileSync(envPath, "utf8").split("\n")) {
        const line = rawLine.trim();
        if (line.length === 0 || line.startsWith("#")) {
            continue;
        }
        const match = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(line);
        if (!match) {
            continue;
        }
        const [, key, rawValue] = match;
        if (process.env[key as string] !== undefined) {
            continue;
        }
        process.env[key as string] = (rawValue as string).replace(/^["']|["']$/g, "");
    }
};

loadEnvLocal();

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
