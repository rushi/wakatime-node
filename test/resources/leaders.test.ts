import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { BASE, makeClient } from "../helpers.js";
import { server } from "../msw/server.js";

const emptyLeaders = { data: [], page: 1, total_pages: 1, range: {} };

describe("leaders and private leaderboards", () => {
    it("forwards board_type to both boards", async () => {
        const boardTypes: (string | null)[] = [];
        const captureBoardType = ({ request }: { request: Request }) => {
            boardTypes.push(new URL(request.url).searchParams.get("board_type"));
            return HttpResponse.json(emptyLeaders);
        };
        server.use(
            http.get(`${BASE}/leaders`, captureBoardType),
            http.get(`${BASE}/users/current/leaderboards/b1`, captureBoardType),
        );

        const client = makeClient();
        await client.leaders.get({ boardType: "ai" });
        await client.leaderboards.leaders("b1", { boardType: "spend" });

        expect(boardTypes).toEqual(["ai", "spend"]);
    });
});
