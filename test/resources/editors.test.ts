import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { BASE, makeClient } from "../helpers.js";
import { server } from "../msw/server.js";

describe("editors resource", () => {
    it("forwards unreleased as a query param", async () => {
        let unreleased: string | null = null;
        server.use(
            http.get(`${BASE}/editors`, ({ request }) => {
                unreleased = new URL(request.url).searchParams.get("unreleased");
                return HttpResponse.json({ data: [] });
            }),
        );

        await makeClient().editors.list({ unreleased: true });

        expect(unreleased).toBe("true");
    });
});
