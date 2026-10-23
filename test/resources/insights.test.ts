import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { BASE, makeClient } from "../helpers.js";
import { server } from "../msw/server.js";

describe("insights resource", () => {
    it("accepts a month range in the path", async () => {
        let isHit = false;
        server.use(
            http.get(`${BASE}/users/current/insights/ai_days/2026-03`, () => {
                isHit = true;
                return HttpResponse.json({ data: {} });
            }),
        );

        await makeClient().insights.get("ai_days", "2026-03");

        expect(isHit).toBe(true);
    });
});
