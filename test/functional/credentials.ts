import type { WakatimeConfig } from "../../src/index.js";

interface LiveCredential {
    label: string;
    config: WakatimeConfig;
}

const { WAKATIME_API_KEY: apiKey, WAKATIME_OAUTH_TOKEN: accessToken } = process.env;

// Credentials present in the environment. Each live suite runs once per entry.
export const liveCredentials: LiveCredential[] = [
    ...(accessToken ? [{ label: "oauth token", config: { accessToken } }] : []),
    ...(apiKey ? [{ label: "api key", config: { apiKey } }] : []),
];
