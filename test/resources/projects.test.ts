import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { BASE, makeClient } from "../helpers.js";
import { server } from "../msw/server.js";

const project = (id: string) => ({ id, name: id });

describe("projects resource", () => {
    it("concatenates items across pages in order", async () => {
        server.use(
            http.get(`${BASE}/users/current/projects`, ({ request }) => {
                const page = Number(new URL(request.url).searchParams.get("page") ?? "1");
                if (page === 1) {
                    return HttpResponse.json({ data: [project("a"), project("b")], page: 1, next_page: 2 });
                }
                return HttpResponse.json({ data: [project("c")], page: 2, next_page: null });
            }),
        );

        const projects = await makeClient().projects.list();

        expect(projects.map((p) => p.id)).toEqual(["a", "b", "c"]);
    });

    it("returns just the items when there is no next_page", async () => {
        server.use(
            http.get(`${BASE}/users/current/projects`, () =>
                HttpResponse.json({ data: [project("a")], page: 1, next_page: null }),
            ),
        );

        const projects = await makeClient().projects.list();

        expect(projects.map((p) => p.id)).toEqual(["a"]);
    });

    it("returns an empty list when the first page is empty", async () => {
        server.use(
            http.get(`${BASE}/users/current/projects`, () =>
                HttpResponse.json({ data: [], page: 1, next_page: null }),
            ),
        );

        const projects = await makeClient().projects.list();

        expect(projects).toEqual([]);
    });

    it("forwards the q filter on every page request", async () => {
        const seenQ: Array<string | null> = [];
        server.use(
            http.get(`${BASE}/users/current/projects`, ({ request }) => {
                const url = new URL(request.url);
                const page = Number(url.searchParams.get("page") ?? "1");
                seenQ.push(url.searchParams.get("q"));
                if (page === 1) {
                    return HttpResponse.json({ data: [project("a")], page: 1, next_page: 2 });
                }
                return HttpResponse.json({ data: [project("b")], page: 2, next_page: null });
            }),
        );

        await makeClient().projects.list({ q: "sdk" });

        expect(seenQ).toEqual(["sdk", "sdk"]);
    });
});
