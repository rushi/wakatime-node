import axios, { isAxiosError } from "axios";

import { mapErrorFromResponse, WakatimeError } from "../http/errors.js";
import type { WakatimeScope } from "../types/scopes.js";

const OAUTH_BASE_URL = "https://wakatime.com/oauth";
const OAUTH_TIMEOUT_MS = 30_000;

export interface OAuthToken {
    access_token: string;
    refresh_token?: string | undefined;
    token_type: string;
    scope?: string | undefined;
    expires_in?: number | undefined;
    expires_at?: string | undefined;
    uid?: string | undefined;
}

export interface AuthorizeUrlParams {
    clientId: string;
    redirectUri: string;
    // "code" for the standard server-side flow (365-day tokens); "token" for
    // the implicit flow (12-hour tokens).
    responseType?: "code" | "token";
    scopes?: WakatimeScope[];
    state?: string;
    forceApprove?: boolean;
}

export interface ExchangeCodeParams {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    code: string;
}

export interface RefreshTokenParams {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    refreshToken: string;
}

export interface RevokeTokenParams {
    clientId: string;
    clientSecret: string;
    token: string;
}

// Build the URL to redirect users to so they can authorize the app.
export const buildAuthorizeUrl = (params: AuthorizeUrlParams): string => {
    const query = new URLSearchParams({
        client_id: params.clientId,
        redirect_uri: params.redirectUri,
        response_type: params.responseType ?? "code",
    });
    if (params.scopes && params.scopes.length > 0) {
        query.set("scope", params.scopes.join(","));
    }
    if (params.state !== undefined) {
        query.set("state", params.state);
    }
    if (params.forceApprove) {
        query.set("force_approve", "true");
    }
    return `${OAUTH_BASE_URL}/authorize?${query.toString()}`;
};

// WakaTime's token endpoint may reply with form-urlencoded or JSON; normalize
// both into an OAuthToken and coerce the numeric expires_in.
const parseTokenResponse = (data: unknown): OAuthToken => {
    const record =
        typeof data === "string" ? Object.fromEntries(new URLSearchParams(data)) : (data as Record<string, unknown>);

    if (typeof record.access_token !== "string" || record.access_token.length === 0) {
        throw new WakatimeError("OAuth token response did not include an access_token.");
    }

    const expiresInRaw = record.expires_in;
    const expiresIn = expiresInRaw === undefined ? undefined : Number(expiresInRaw);

    return {
        access_token: record.access_token,
        refresh_token: record.refresh_token === undefined ? undefined : String(record.refresh_token),
        token_type: record.token_type === undefined ? "bearer" : String(record.token_type),
        scope: record.scope === undefined ? undefined : String(record.scope),
        expires_in: expiresIn !== undefined && Number.isFinite(expiresIn) ? expiresIn : undefined,
        expires_at: record.expires_at === undefined ? undefined : String(record.expires_at),
        uid: record.uid === undefined ? undefined : String(record.uid),
    };
};

const postForm = async (path: string, body: Record<string, string>): Promise<unknown> => {
    try {
        const response = await axios.post(`${OAUTH_BASE_URL}/${path}`, new URLSearchParams(body).toString(), {
            headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
            timeout: OAUTH_TIMEOUT_MS,
        });
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            throw mapErrorFromResponse(error);
        }
        throw error;
    }
};

// POST /oauth/token with grant_type=authorization_code.
export const exchangeCode = async (params: ExchangeCodeParams): Promise<OAuthToken> => {
    const data = await postForm("token", {
        client_id: params.clientId,
        client_secret: params.clientSecret,
        redirect_uri: params.redirectUri,
        grant_type: "authorization_code",
        code: params.code,
    });
    return parseTokenResponse(data);
};

// POST /oauth/token with grant_type=refresh_token.
export const refreshToken = async (params: RefreshTokenParams): Promise<OAuthToken> => {
    const data = await postForm("token", {
        client_id: params.clientId,
        client_secret: params.clientSecret,
        redirect_uri: params.redirectUri,
        grant_type: "refresh_token",
        refresh_token: params.refreshToken,
    });
    return parseTokenResponse(data);
};

// POST /oauth/revoke to invalidate an access or refresh token.
export const revokeToken = async (params: RevokeTokenParams): Promise<void> => {
    await postForm("revoke", {
        client_id: params.clientId,
        client_secret: params.clientSecret,
        token: params.token,
    });
};
