import type { AxiosError } from "axios";

interface WakatimeErrorOptions {
    statusCode?: number | undefined;
    apiErrors?: string[] | undefined;
    retryAfter?: number | undefined;
    method?: string | undefined;
    url?: string | undefined;
    cause?: unknown;
}

// Base class for every error surfaced by the SDK. Consumers can `instanceof
// WakatimeError` to catch all of them, or narrow to a subclass by status.
export class WakatimeError extends Error {
    readonly statusCode: number | undefined;
    readonly apiErrors: string[];
    readonly method: string | undefined;
    readonly url: string | undefined;

    constructor(message: string, options: WakatimeErrorOptions = {}) {
        super(message, options.cause === undefined ? undefined : { cause: options.cause });
        this.name = new.target.name;
        this.statusCode = options.statusCode;
        this.apiErrors = options.apiErrors ?? [];
        this.method = options.method;
        this.url = options.url;
    }
}

// 400 - request was rejected as invalid.
export class WakatimeValidationError extends WakatimeError {}

// 401 / 403 - missing, invalid, or insufficiently scoped credentials.
export class WakatimeAuthError extends WakatimeError {}

// 404 - the resource does not exist.
export class WakatimeNotFoundError extends WakatimeError {}

// 429 - rate limited. `retryAfter` is the seconds hint from the Retry-After
// header when WakaTime provides one.
export class WakatimeRateLimitError extends WakatimeError {
    readonly retryAfter: number | undefined;

    constructor(message: string, options: WakatimeErrorOptions = {}) {
        super(message, options);
        this.retryAfter = options.retryAfter;
    }
}

// 5xx - WakaTime is unavailable or errored server-side.
export class WakatimeServerError extends WakatimeError {}

// The request never reached the server (DNS, connection reset, timeout).
export class WakatimeNetworkError extends WakatimeError {}

// The client was constructed with invalid options (thrown before any request).
export class WakatimeConfigError extends WakatimeError {}

// Pull human-readable messages out of WakaTime's inconsistent error envelope,
// which may use `errors` (array), `error` (string), or `message` (string).
const extractApiErrors = (data: unknown): string[] => {
    if (!data || typeof data !== "object") {
        return [];
    }
    const body = data as Record<string, unknown>;
    if (Array.isArray(body.errors)) {
        return body.errors.filter((entry): entry is string => typeof entry === "string");
    }
    if (typeof body.error === "string") {
        return [body.error];
    }
    if (typeof body.message === "string") {
        return [body.message];
    }
    return [];
};

const parseRetryAfter = (headerValue: unknown): number | undefined => {
    if (typeof headerValue !== "string") {
        return undefined;
    }
    // Retry-After is either delta-seconds or an HTTP-date (RFC 7231).
    const seconds = Number(headerValue);
    if (Number.isFinite(seconds)) {
        return seconds;
    }
    const dateMs = Date.parse(headerValue);
    if (Number.isNaN(dateMs)) {
        return undefined;
    }
    const deltaSeconds = Math.ceil((dateMs - Date.now()) / 1000);
    return deltaSeconds > 0 ? deltaSeconds : 0;
};

// Convert a rejected axios request into the matching WakatimeError subclass.
export const mapErrorFromResponse = (error: AxiosError): WakatimeError => {
    const method = error.config?.method?.toUpperCase();
    const url = error.config?.url;

    if (!error.response) {
        return new WakatimeNetworkError(error.message || "Network request failed", {
            method,
            url,
            cause: error,
        });
    }

    const { status, data, headers } = error.response;
    const apiErrors = extractApiErrors(data);
    const message = apiErrors[0] ?? `WakaTime request failed with status ${status}`;
    const base: WakatimeErrorOptions = { statusCode: status, apiErrors, method, url, cause: error };

    if (status === 400) {
        return new WakatimeValidationError(message, base);
    }
    if (status === 401 || status === 403) {
        return new WakatimeAuthError(message, base);
    }
    if (status === 404) {
        return new WakatimeNotFoundError(message, base);
    }
    if (status === 429) {
        const retryAfter = parseRetryAfter((headers as Record<string, unknown>)["retry-after"]);
        return new WakatimeRateLimitError(message, { ...base, retryAfter });
    }
    if (status >= 500) {
        return new WakatimeServerError(message, base);
    }
    return new WakatimeError(message, base);
};
