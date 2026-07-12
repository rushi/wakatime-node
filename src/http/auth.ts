import { Buffer } from "node:buffer";

import type { InternalAxiosRequestConfig } from "axios";

import type { ResolvedConfig } from "../config.js";

type Credential = ResolvedConfig["credential"];

// Inject credentials into an outgoing request. WakaTime accepts three forms:
// Bearer token (OAuth), Basic-encoded API key, or an `api_key` query param.
export const applyAuth = (request: InternalAxiosRequestConfig, credential: Credential): InternalAxiosRequestConfig => {
    if (credential.kind === "oauth") {
        request.headers.set("Authorization", `Bearer ${credential.accessToken}`);
        return request;
    }

    if (credential.useQueryParam) {
        request.params = { ...(request.params ?? {}), api_key: credential.apiKey };
        return request;
    }

    // WakaTime expects base64 of the raw key (no "key:" pairing), per their docs.
    const encodedKey = Buffer.from(credential.apiKey).toString("base64");
    request.headers.set("Authorization", `Basic ${encodedKey}`);
    return request;
};
