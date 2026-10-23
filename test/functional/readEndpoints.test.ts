import { beforeAll, describe, expect, it } from "vitest";

import { WakatimeClient } from "../../src/index.js";
import { liveCredentials } from "./credentials.js";

// These tests hit the real WakaTime API, once per credential found in the
// environment, and only exercise read endpoints so they never mutate the account.
const toIsoDate = (offsetDays: number): string => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + offsetDays);
    return date.toISOString().slice(0, 10);
};

describe.skipIf(liveCredentials.length === 0)("live read endpoints", () => {
    describe.each(liveCredentials)("with $label", ({ config }) => {
        let client: WakatimeClient;

        beforeAll(() => {
            client = new WakatimeClient(config);
        });

        it("users.current returns the authenticated user", async () => {
            const user = await client.users.current();
            expect(typeof user.id).toBe("string");
            expect(user.id.length).toBeGreaterThan(0);
        });

        it("allTimeSinceToday returns a total", async () => {
            const total = await client.allTimeSinceToday.get();
            expect(typeof total.total_seconds).toBe("number");
            expect(typeof total.is_up_to_date).toBe("boolean");
        });

        it("stats.get returns a stats object for last_7_days", async () => {
            const stats = await client.stats.get("last_7_days");
            expect(stats.range).toBe("last_7_days");
            expect(Array.isArray(stats.languages)).toBe(true);
            expect(typeof stats.is_up_to_date).toBe("boolean");
        });

        it("summaries.list returns one entry per day in the window", async () => {
            const summaries = await client.summaries.list({ start: toIsoDate(-6), end: toIsoDate(0) });
            expect(Array.isArray(summaries.data)).toBe(true);
            expect(summaries.data.length).toBeGreaterThanOrEqual(1);
            expect(typeof summaries.data[0]?.grand_total.total_seconds).toBe("number");
        });

        it("statusBar.today returns today's grand total", async () => {
            const today = await client.statusBar.today();
            expect(typeof today.grand_total.total_seconds).toBe("number");
        });

        it("projects.list returns an array", async () => {
            const projects = await client.projects.list();
            expect(Array.isArray(projects)).toBe(true);
        });

        // list() walks every page; an active account can have ~30 pages at ~1.5s each.
        it("machineNames and userAgents return arrays", { timeout: 120_000 }, async () => {
            const [machines, agents] = await Promise.all([client.machineNames.list(), client.userAgents.list()]);
            expect(Array.isArray(machines)).toBe(true);
            expect(Array.isArray(agents)).toBe(true);
        });

        it("goals.list returns an array", async () => {
            const goals = await client.goals.list();
            expect(Array.isArray(goals)).toBe(true);
        });

        it("global editors, program_languages, and meta resolve", async () => {
            const [editors, languages, meta] = await Promise.all([
                client.editors.list(),
                client.programLanguages.list(),
                client.meta.get(),
            ]);
            expect(Array.isArray(editors)).toBe(true);
            expect(languages.length).toBeGreaterThan(0);
            expect(meta).toBeTypeOf("object");
        });
    });
});
