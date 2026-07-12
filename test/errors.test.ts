import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import {
    WakatimeAuthError,
    WakatimeError,
    WakatimeNotFoundError,
    WakatimeRateLimitError,
    WakatimeServerError,
    WakatimeValidationError,
} from "../src/index.js";
import { BASE, makeClient } from "./helpers.js";
import { server } from "./msw/server.js";

const respondStatus = (status: number, body: Record<string, unknown> = { errors: ["boom"] }) => {
    server.use(http.get(`${BASE}/users/current`, () => HttpResponse.json(body, { status })));
};

describe("error mapping", () => {
    it.each([
        [400, WakatimeValidationError],
        [401, WakatimeAuthError],
        [403, WakatimeAuthError],
        [404, WakatimeNotFoundError],
        [500, WakatimeServerError],
        [503, WakatimeServerError],
    ])("maps HTTP %s to the right error subclass", async (status, ExpectedError) => {
        respondStatus(status);
        await expect(makeClient({ maxRetries: 0 }).users.current()).rejects.toBeInstanceOf(ExpectedError);
    });

    it("exposes the parsed API error message and status", async () => {
        respondStatus(400, { errors: ["Invalid range"] });
        await expect(makeClient({ maxRetries: 0 }).users.current()).rejects.toMatchObject({
            statusCode: 400,
            apiErrors: ["Invalid range"],
            message: "Invalid range",
        });
    });

    it("maps 429 to a rate limit error with retryAfter from the header", async () => {
        server.use(
            http.get(`${BASE}/users/current`, () =>
                HttpResponse.json({ error: "slow down" }, { status: 429, headers: { "Retry-After": "42" } }),
            ),
        );

        const error = await makeClient({ maxRetries: 0 })
            .users.current()
            .catch((caught: unknown) => caught);

        expect(error).toBeInstanceOf(WakatimeRateLimitError);
        expect((error as WakatimeRateLimitError).retryAfter).toBe(42);
    });

    it("does not treat 202 as an error and returns the payload", async () => {
        server.use(
            http.get(`${BASE}/users/current/stats/last_7_days`, () =>
                HttpResponse.json({ data: { is_up_to_date: false, percent_calculated: 40 } }, { status: 202 }),
            ),
        );

        const stats = await makeClient().stats.get("last_7_days");

        expect(stats.is_up_to_date).toBe(false);
        expect(stats.percent_calculated).toBe(40);
    });

    it("every subclass is catchable as WakatimeError", async () => {
        respondStatus(404);
        await expect(makeClient({ maxRetries: 0 }).users.current()).rejects.toBeInstanceOf(WakatimeError);
    });
});
