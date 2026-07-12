import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { BASE, makeClient } from "../helpers.js";
import { server } from "../msw/server.js";

describe("stats resource", () => {
    it("unwraps the data envelope and hits the range path", async () => {
        server.use(
            http.get(`${BASE}/users/current/stats/last_7_days`, () =>
                HttpResponse.json({
                    data: {
                        range: "last_7_days",
                        start: "2026-01-01",
                        end: "2026-01-07",
                        total_seconds: 3600,
                        daily_average: 514,
                        is_up_to_date: true,
                        categories: [],
                        projects: [],
                        languages: [
                            {
                                name: "TypeScript",
                                total_seconds: 3600,
                                percent: 100,
                                digital: "1:00",
                                text: "1 hr",
                                hours: 1,
                                minutes: 0,
                            },
                        ],
                        editors: [],
                        operating_systems: [],
                        dependencies: [],
                        machines: [],
                    },
                }),
            ),
        );

        const stats = await makeClient().stats.get("last_7_days");

        expect(stats.total_seconds).toBe(3600);
        expect(stats.languages[0]?.name).toBe("TypeScript");
    });

    it("forwards options as snake_case query params for another user", async () => {
        let query: URLSearchParams | null = null;
        server.use(
            http.get(`${BASE}/users/ada/stats/last_30_days`, ({ request }) => {
                query = new URL(request.url).searchParams;
                return HttpResponse.json({
                    data: {
                        range: "last_30_days",
                        start: "x",
                        end: "y",
                        total_seconds: 0,
                        daily_average: 0,
                        is_up_to_date: true,
                        categories: [],
                        projects: [],
                        languages: [],
                        editors: [],
                        operating_systems: [],
                        dependencies: [],
                        machines: [],
                    },
                });
            }),
        );

        await makeClient().stats.get("last_30_days", { user: "ada", writesOnly: true, project: "sdk" });

        expect(query!.get("writes_only")).toBe("true");
        expect(query!.get("project")).toBe("sdk");
    });
});
