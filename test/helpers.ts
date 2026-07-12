import { WakatimeClient } from "../src/index.js";
import type { WakatimeConfig } from "../src/index.js";

// Default base URL the SDK targets; MSW handlers are registered against it.
export const BASE = "https://api.wakatime.com/api/v1";

// Allow tests to explicitly pass `undefined` to drop the default credential.
type ConfigOverrides = { [K in keyof WakatimeConfig]?: WakatimeConfig[K] | undefined };

// Build a client with a test API key, allowing per-test config overrides.
export const makeClient = (overrides: ConfigOverrides = {}): WakatimeClient => {
    return new WakatimeClient({ apiKey: "test-key", maxRetries: 2, ...overrides } as WakatimeConfig);
};
