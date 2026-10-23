import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import type { OrgCustomRuleInput } from "../../src/index.js";
import { BASE, makeClient } from "../helpers.js";
import { server } from "../msw/server.js";

const emptyDurations = { data: [], start: "s", end: "e" };
const emptySummaries = { data: [], start: "s", end: "e" };
const DASHBOARD = `${BASE}/users/current/orgs/o1/dashboards/d1`;

const queryOf = (request: Request) => Object.fromEntries(new URL(request.url).searchParams);

describe("orgs resource", () => {
    it("sends date, project, and branches for dashboard summaries", async () => {
        let query: Record<string, string> = {};
        server.use(
            http.get(`${DASHBOARD}/summaries`, ({ request }) => {
                query = queryOf(request);
                return HttpResponse.json(emptySummaries);
            }),
        );

        await makeClient().orgs.dashboardSummaries("o1", "d1", "2026-01-02", { project: "sdk", branches: "main,dev" });

        expect(query).toEqual({ date: "2026-01-02", project: "sdk", branches: "main,dev" });
    });

    it("sends slice_by and filters for dashboard and member durations", async () => {
        const queries: Record<string, string>[] = [];
        server.use(
            http.get(`${DASHBOARD}/durations`, ({ request }) => {
                queries.push(queryOf(request));
                return HttpResponse.json(emptyDurations);
            }),
            http.get(`${DASHBOARD}/members/m1/durations`, ({ request }) => {
                queries.push(queryOf(request));
                return HttpResponse.json(emptyDurations);
            }),
        );

        const client = makeClient();
        await client.orgs.dashboardDurations("o1", "d1", "2026-01-02", { sliceBy: "language", branches: "main" });
        await client.orgs.memberDurations("o1", "d1", "m1", "2026-01-02", { project: "sdk" });

        expect(queries).toEqual([
            { date: "2026-01-02", slice_by: "language", branches: "main" },
            { date: "2026-01-02", project: "sdk" },
        ]);
    });

    it("accepts a named range for member summaries", async () => {
        let query: Record<string, string> = {};
        server.use(
            http.get(`${DASHBOARD}/members/m1/summaries`, ({ request }) => {
                query = queryOf(request);
                return HttpResponse.json(emptySummaries);
            }),
        );

        await makeClient().orgs.memberSummaries("o1", "d1", "m1", { range: "Last 7 Days", branches: "main" });

        expect(query).toEqual({ range: "Last 7 Days", branches: "main" });
    });

    it("puts org custom rules as an array with nested destinations", async () => {
        const rule: OrgCustomRuleInput = {
            action: "change",
            source: "project",
            operation: "starts with",
            source_value: "acme-",
            destinations: [{ destination: "project", destination_value: "acme" }],
            priority: 1,
        };
        let body: unknown = null;
        server.use(
            http.put(`${BASE}/users/current/orgs/o1/custom_rules`, async ({ request }) => {
                body = await request.json();
                return HttpResponse.json({ data: { changes: { added: [], removed: [], rearranged: [] } } });
            }),
        );

        const result = await makeClient().orgs.updateCustomRules("o1", [rule]);

        expect(body).toEqual([rule]);
        expect(result.changes.removed).toEqual([]);
    });
});
