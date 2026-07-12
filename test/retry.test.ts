import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { WakatimeServerError } from "../src/index.js";
import { computeBackoffMs, isRetryableStatus } from "../src/http/retry.js";
import { BASE, makeClient } from "./helpers.js";
import { server } from "./msw/server.js";

describe("retry policy", () => {
    it("classifies retryable statuses", () => {
        expect(isRetryableStatus(302)).toBe(true);
        expect(isRetryableStatus(429)).toBe(true);
        expect(isRetryableStatus(500)).toBe(true);
        expect(isRetryableStatus(503)).toBe(true);
        expect(isRetryableStatus(400)).toBe(false);
        expect(isRetryableStatus(404)).toBe(false);
    });

    it("honours Retry-After over exponential backoff", () => {
        expect(computeBackoffMs(0, 5)).toBe(5000);
        expect(computeBackoffMs(3, 2)).toBe(2000);
    });

    it("grows the backoff window as attempts increase", () => {
        expect(computeBackoffMs(0)).toBeGreaterThanOrEqual(300);
        expect(computeBackoffMs(2)).toBeGreaterThanOrEqual(1200);
    });

    it("retries a 429 then resolves on the following success", async () => {
        let calls = 0;
        server.use(
            http.get(`${BASE}/users/current`, () => {
                calls += 1;
                if (calls === 1) {
                    return HttpResponse.json({ error: "slow" }, { status: 429, headers: { "Retry-After": "0" } });
                }
                return HttpResponse.json({ data: { id: "1", username: "ada" } });
            }),
        );

        const user = await makeClient({ maxRetries: 2 }).users.current();

        expect(calls).toBe(2);
        expect(user.username).toBe("ada");
    });

    it("gives up after exhausting retries", async () => {
        let calls = 0;
        server.use(
            http.get(`${BASE}/users/current`, () => {
                calls += 1;
                return HttpResponse.json({ error: "down" }, { status: 500 });
            }),
        );

        await expect(makeClient({ maxRetries: 1 }).users.current()).rejects.toBeInstanceOf(WakatimeServerError);
        expect(calls).toBe(2);
    });
});
