import { WakatimeConfigError } from "./http/errors.js";

// Bumped in lockstep with package.json; sent as the default User-Agent so
// WakaTime can attribute traffic to this SDK.
export const SDK_VERSION = "0.1.0";

const DEFAULT_BASE_URL = "https://api.wakatime.com/api/v1";
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_USER_AGENT = `wakatime-node/${SDK_VERSION}`;

export interface WakatimeConfig {
    // Secret API key (HTTP Basic auth). Mutually exclusive with `accessToken`.
    apiKey?: string;
    // OAuth 2.0 bearer access token. Mutually exclusive with `apiKey`.
    accessToken?: string;
    // Send the API key as an `api_key` query param instead of a Basic header.
    // Ignored when authenticating with `accessToken`.
    useApiKeyQueryParam?: boolean;
    // Override the API base URL (e.g. for a proxy). Trailing slash optional.
    baseURL?: string;
    // Per-request timeout in milliseconds.
    timeoutMs?: number;
    // Max automatic retries on 429/302/5xx responses. Set 0 to disable.
    maxRetries?: number;
    // Value sent in the User-Agent request header.
    userAgent?: string;
}

// Config with all optionals resolved to concrete defaults, produced by
// `resolveConfig` and consumed by the HTTP layer.
export interface ResolvedConfig {
    credential: { kind: "apiKey"; apiKey: string; useQueryParam: boolean } | { kind: "oauth"; accessToken: string };
    baseURL: string;
    timeoutMs: number;
    maxRetries: number;
    userAgent: string;
}

// Validate user config and fill defaults. Throws early if neither or both
// credentials are supplied so misuse fails at construction, not on first call.
export const resolveConfig = (config: WakatimeConfig): ResolvedConfig => {
    const hasApiKey = typeof config.apiKey === "string" && config.apiKey.length > 0;
    const hasAccessToken = typeof config.accessToken === "string" && config.accessToken.length > 0;

    if (hasApiKey && hasAccessToken) {
        throw new WakatimeConfigError("Provide either `apiKey` or `accessToken`, not both.");
    }
    if (!hasApiKey && !hasAccessToken) {
        throw new WakatimeConfigError("Provide either an `apiKey` or an OAuth `accessToken`.");
    }

    const credential: ResolvedConfig["credential"] = hasApiKey
        ? { kind: "apiKey", apiKey: config.apiKey as string, useQueryParam: config.useApiKeyQueryParam ?? false }
        : { kind: "oauth", accessToken: config.accessToken as string };

    return {
        credential,
        baseURL: (config.baseURL ?? DEFAULT_BASE_URL).replace(/\/+$/, ""),
        timeoutMs: config.timeoutMs ?? DEFAULT_TIMEOUT_MS,
        maxRetries: config.maxRetries ?? DEFAULT_MAX_RETRIES,
        userAgent: config.userAgent ?? DEFAULT_USER_AGENT,
    };
};
