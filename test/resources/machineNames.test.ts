import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { BASE, makeClient } from "../helpers.js";
import { server } from "../msw/server.js";

const machineName = (id: string) => ({ id, name: id, value: `machine-${id}` });

describe("machine names resource", () => {
    it("concatenates items across pages in order", async () => {
        server.use(
            http.get(`${BASE}/users/current/machine_names`, ({ request }) => {
                const page = Number(new URL(request.url).searchParams.get("page") ?? "1");
                if (page === 1) {
                    return HttpResponse.json({ data: [machineName("a"), machineName("b")], page: 1, next_page: 2 });
                }
                return HttpResponse.json({ data: [machineName("c")], page: 2, next_page: null });
            }),
        );

        const machines = await makeClient().machineNames.list();

        expect(machines.map((m) => m.id)).toEqual(["a", "b", "c"]);
    });

    it("returns just the items when there is no next_page", async () => {
        server.use(
            http.get(`${BASE}/users/current/machine_names`, () =>
                HttpResponse.json({ data: [machineName("a")], page: 1, next_page: null }),
            ),
        );

        const machines = await makeClient().machineNames.list();

        expect(machines.map((m) => m.id)).toEqual(["a"]);
    });

    it("returns an empty list when the first page is empty", async () => {
        server.use(
            http.get(`${BASE}/users/current/machine_names`, () =>
                HttpResponse.json({ data: [], page: 1, next_page: null }),
            ),
        );

        const machines = await makeClient().machineNames.list();

        expect(machines).toEqual([]);
    });
});
