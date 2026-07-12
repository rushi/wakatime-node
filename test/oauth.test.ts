import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { buildAuthorizeUrl, exchangeCode, revokeToken } from "../src/index.js";
import { server } from "./msw/server.js";

const TOKEN_URL = "https://wakatime.com/oauth/token";
const REVOKE_URL = "https://wakatime.com/oauth/revoke";

describe("oauth helpers", () => {
    it("builds an authorize URL with scopes and state", () => {
        const url = buildAuthorizeUrl({
            clientId: "cid",
            redirectUri: "https://app/cb",
            scopes: ["email", "read_stats.languages"],
            state: "xyz",
        });
        const parsed = new URL(url);

        expect(parsed.origin + parsed.pathname).toBe("https://wakatime.com/oauth/authorize");
        expect(parsed.searchParams.get("client_id")).toBe("cid");
        expect(parsed.searchParams.get("response_type")).toBe("code");
        expect(parsed.searchParams.get("scope")).toBe("email,read_stats.languages");
        expect(parsed.searchParams.get("state")).toBe("xyz");
    });

    it("parses a form-urlencoded token response", async () => {
        server.use(
            http.post(TOKEN_URL, () =>
                HttpResponse.text("access_token=waka_tok_1&refresh_token=r1&token_type=bearer&expires_in=3600", {
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                }),
            ),
        );

        const token = await exchangeCode({
            clientId: "cid",
            clientSecret: "sec",
            redirectUri: "https://app/cb",
            code: "abc",
        });

        expect(token.access_token).toBe("waka_tok_1");
        expect(token.refresh_token).toBe("r1");
        expect(token.expires_in).toBe(3600);
    });

    it("parses a JSON token response", async () => {
        server.use(
            http.post(TOKEN_URL, () =>
                HttpResponse.json({ access_token: "waka_tok_2", token_type: "bearer", scope: "email" }),
            ),
        );

        const token = await exchangeCode({
            clientId: "cid",
            clientSecret: "sec",
            redirectUri: "https://app/cb",
            code: "abc",
        });

        expect(token.access_token).toBe("waka_tok_2");
        expect(token.scope).toBe("email");
    });

    it("throws when the token response has no access_token", async () => {
        server.use(http.post(TOKEN_URL, () => HttpResponse.json({ error: "invalid_grant" }, { status: 200 })));

        await expect(
            exchangeCode({ clientId: "cid", clientSecret: "sec", redirectUri: "https://app/cb", code: "bad" }),
        ).rejects.toThrow(/access_token/);
    });

    it("revokes a token without throwing on success", async () => {
        server.use(http.post(REVOKE_URL, () => HttpResponse.json({}, { status: 200 })));

        await expect(
            revokeToken({ clientId: "cid", clientSecret: "sec", token: "waka_tok_1" }),
        ).resolves.toBeUndefined();
    });
});
