import { Buffer } from "node:buffer";

import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { WakatimeConfigError } from "../src/index.js";
import { BASE, makeClient } from "./helpers.js";
import { server } from "./msw/server.js";

const userPayload = { data: { id: "1", username: "ada" } };

describe("authentication", () => {
    it("sends the API key as a Basic base64 header by default", async () => {
        let authHeader: string | null = null;
        server.use(
            http.get(`${BASE}/users/current`, ({ request }) => {
                authHeader = request.headers.get("authorization");
                return HttpResponse.json(userPayload);
            }),
        );

        await makeClient({ apiKey: "12345" }).users.current();

        expect(authHeader).toBe(`Basic ${Buffer.from("12345").toString("base64")}`);
    });

    it("sends an OAuth access token as a Bearer header", async () => {
        let authHeader: string | null = null;
        server.use(
            http.get(`${BASE}/users/current`, ({ request }) => {
                authHeader = request.headers.get("authorization");
                return HttpResponse.json(userPayload);
            }),
        );

        await makeClient({ apiKey: undefined, accessToken: "waka_tok_abc" }).users.current();

        expect(authHeader).toBe("Bearer waka_tok_abc");
    });

    it("sends the API key as a query param when configured", async () => {
        let apiKeyParam: string | null = null;
        let authHeader: string | null = null;
        server.use(
            http.get(`${BASE}/users/current`, ({ request }) => {
                apiKeyParam = new URL(request.url).searchParams.get("api_key");
                authHeader = request.headers.get("authorization");
                return HttpResponse.json(userPayload);
            }),
        );

        await makeClient({ apiKey: "abc", useApiKeyQueryParam: true }).users.current();

        expect(apiKeyParam).toBe("abc");
        expect(authHeader).toBeNull();
    });

    it("throws when both apiKey and accessToken are provided", () => {
        expect(() => makeClient({ apiKey: "a", accessToken: "b" })).toThrow(WakatimeConfigError);
    });

    it("throws when no credential is provided", () => {
        expect(() => makeClient({ apiKey: undefined })).toThrow(WakatimeConfigError);
    });
});
