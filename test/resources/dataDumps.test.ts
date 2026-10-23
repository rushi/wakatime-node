import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { BASE, makeClient } from "../helpers.js";
import { server } from "../msw/server.js";

describe("data dumps resource", () => {
    it("asks for a finish email by default, matching the API", async () => {
        let body: unknown = null;
        server.use(
            http.post(`${BASE}/users/current/data_dumps`, async ({ request }) => {
                body = await request.json();
                return HttpResponse.json({ data: { id: "dd1", type: "daily", status: "Pending" } }, { status: 201 });
            }),
        );

        await makeClient().dataDumps.create("daily");

        expect(body).toEqual({ type: "daily", email_when_finished: true });
    });
});
