import { describe, expect, it } from "vitest";

import { WakatimeClient } from "../../src/index.js";
import { liveCredentials } from "./credentials.js";

// "Hello world" for the live API: each configured credential can fetch the current user.
describe.skipIf(liveCredentials.length === 0)("live credentials", () => {
    describe.each(liveCredentials)("with $label", ({ config }) => {
        it("authenticates and returns the current user", async () => {
            const client = new WakatimeClient(config);
            const user = await client.users.current();

            expect(typeof user.id).toBe("string");
            expect(user.id.length).toBeGreaterThan(0);
        });
    });
});
