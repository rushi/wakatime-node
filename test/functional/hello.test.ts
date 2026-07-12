import { describe, expect, it } from "vitest";

import { WakatimeClient } from "../../src/index.js";

// "Hello world" for the live API: proves the configured WAKATIME_API_KEY is
// valid by fetching the authenticated user. Skips when no key is present.
const apiKey = process.env.WAKATIME_API_KEY;

describe.skipIf(!apiKey)("live API key", () => {
    it("authenticates and returns the current user", async () => {
        const client = new WakatimeClient({ apiKey: apiKey as string });
        const user = await client.users.current();

        expect(typeof user.id).toBe("string");
        expect(user.id.length).toBeGreaterThan(0);
    });
});
