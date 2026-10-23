import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import type { HeartbeatInput } from "../../src/index.js";
import { WakatimeServerError } from "../../src/index.js";
import { BASE, makeClient } from "../helpers.js";
import { server } from "../msw/server.js";

const heartbeat: HeartbeatInput = { entity: "/src/index.ts", type: "file", time: 1_700_000_000, is_write: true };

describe("heartbeats resource", () => {
    it("posts a single heartbeat and unwraps the created record", async () => {
        let body: unknown = null;
        let machineHeader: string | null = null;
        server.use(
            http.post(`${BASE}/users/current/heartbeats`, async ({ request }) => {
                body = await request.json();
                machineHeader = request.headers.get("x-machine-name");
                return HttpResponse.json({ data: { ...heartbeat, id: "hb1" } }, { status: 201 });
            }),
        );

        const created = await makeClient().heartbeats.create(heartbeat, { machineName: "laptop" });

        expect(created.id).toBe("hb1");
        expect(body).toMatchObject({ entity: "/src/index.ts", type: "file" });
        expect(machineHeader).toBe("laptop");
    });

    it("deletes heartbeats for a date by id via the bulk endpoint", async () => {
        let deletedBody: unknown = null;
        server.use(
            http.delete(`${BASE}/users/current/heartbeats.bulk`, async ({ request }) => {
                deletedBody = await request.json();
                return HttpResponse.json({}, { status: 200 });
            }),
        );

        await makeClient().heartbeats.deleteBulk("2026-01-02", ["hb1", "hb2"]);

        expect(deletedBody).toEqual({ date: "2026-01-02", ids: ["hb1", "hb2"] });
    });

    it("does not retry a POST (non-idempotent) on a 5xx", async () => {
        let calls = 0;
        server.use(
            http.post(`${BASE}/users/current/heartbeats`, () => {
                calls += 1;
                return HttpResponse.json({ error: "down" }, { status: 500 });
            }),
        );

        await expect(makeClient({ maxRetries: 3 }).heartbeats.create(heartbeat)).rejects.toBeInstanceOf(
            WakatimeServerError,
        );
        expect(calls).toBe(1);
    });
});
