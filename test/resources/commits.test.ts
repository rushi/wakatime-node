import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { BASE, makeClient } from "../helpers.js";
import { server } from "../msw/server.js";

const commit = (hash: string) => ({ id: hash, hash, branch: "main", message: `msg ${hash}`, author_name: "ada" });
const project = { id: "p1", name: "sdk" };

describe("commits resource", () => {
    it("returns a single page of commits", async () => {
        server.use(
            http.get(`${BASE}/users/current/projects/sdk/commits`, () =>
                HttpResponse.json({
                    commits: [commit("a"), commit("b")],
                    project,
                    page: 1,
                    next_page: null,
                    total_pages: 1,
                }),
            ),
        );

        const response = await makeClient().commits.list("sdk");

        expect(response.commits.map((c) => c.hash)).toEqual(["a", "b"]);
    });

    it("iterates every commit across pages", async () => {
        server.use(
            http.get(`${BASE}/users/current/projects/sdk/commits`, ({ request }) => {
                const page = Number(new URL(request.url).searchParams.get("page") ?? "1");
                if (page === 1) {
                    return HttpResponse.json({
                        commits: [commit("a")],
                        project,
                        page: 1,
                        next_page: 2,
                        total_pages: 2,
                    });
                }
                return HttpResponse.json({ commits: [commit("b")], project, page: 2, next_page: null, total_pages: 2 });
            }),
        );

        const hashes: string[] = [];
        for await (const c of makeClient().commits.iterate("sdk")) {
            hashes.push(c.hash);
        }

        expect(hashes).toEqual(["a", "b"]);
    });
});
