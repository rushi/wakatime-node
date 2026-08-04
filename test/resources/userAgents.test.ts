import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { BASE, makeClient } from "../helpers.js";
import { server } from "../msw/server.js";

const userAgent = (id: string) => ({ id, value: `agent-${id}` });

describe("user agents resource", () => {
    it("concatenates items across pages in order", async () => {
        server.use(
            http.get(`${BASE}/users/current/user_agents`, ({ request }) => {
                const page = Number(new URL(request.url).searchParams.get("page") ?? "1");
                if (page === 1) {
                    return HttpResponse.json({ data: [userAgent("a"), userAgent("b")], page: 1, next_page: 2 });
                }
                return HttpResponse.json({ data: [userAgent("c")], page: 2, next_page: null });
            }),
        );

        const agents = await makeClient().userAgents.list();

        expect(agents.map((a) => a.id)).toEqual(["a", "b", "c"]);
    });

    it("returns just the items when there is no next_page", async () => {
        server.use(
            http.get(`${BASE}/users/current/user_agents`, () =>
                HttpResponse.json({ data: [userAgent("a")], page: 1, next_page: null }),
            ),
        );

        const agents = await makeClient().userAgents.list();

        expect(agents.map((a) => a.id)).toEqual(["a"]);
    });

    it("returns an empty list when the first page is empty", async () => {
        server.use(
            http.get(`${BASE}/users/current/user_agents`, () =>
                HttpResponse.json({ data: [], page: 1, next_page: null }),
            ),
        );

        const agents = await makeClient().userAgents.list();

        expect(agents).toEqual([]);
    });
});
