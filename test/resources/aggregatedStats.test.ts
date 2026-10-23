import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { BASE, makeClient } from "../helpers.js";
import { server } from "../msw/server.js";

const metric = { average: 1, count: 2, max: 3, median: 1, sum: 2 };
const body = { data: { range: "2024", total: metric } };

describe("aggregated stats resource", () => {
    it("hits the global /stats/:range path and unwraps data", async () => {
        server.use(http.get(`${BASE}/stats/2024`, () => HttpResponse.json(body)));

        const stats = await makeClient().aggregatedStats.get("2024");

        expect(stats.total?.count).toBe(2);
    });
});
