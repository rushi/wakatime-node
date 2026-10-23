import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { BASE, makeClient } from "../helpers.js";
import { server } from "../msw/server.js";

describe("external durations resource", () => {
    it("deletes external durations for a date by id", async () => {
        let body: unknown = null;
        server.use(
            http.delete(`${BASE}/users/current/external_durations.bulk`, async ({ request }) => {
                body = await request.json();
                return HttpResponse.json({ data: {} });
            }),
        );

        await makeClient().externalDurations.deleteBulk("2026-01-02", ["ed1"]);

        expect(body).toEqual({ date: "2026-01-02", ids: ["ed1"] });
    });
});
