import axios, { isAxiosError } from "axios";
import type { AxiosInstance, AxiosRequestConfig } from "axios";

import type { ResolvedConfig } from "../config.js";
import { applyAuth } from "./auth.js";
import { mapErrorFromResponse, WakatimeRateLimitError } from "./errors.js";
import { computeBackoffMs, delay, isRetryableStatus } from "./retry.js";

// Thin wrapper around a configured axios instance. Owns auth injection, error
// mapping, and retry so resources only deal with typed request shapes.
export class HttpClient {
    private readonly axios: AxiosInstance;
    private readonly maxRetries: number;

    constructor(config: ResolvedConfig) {
        this.maxRetries = config.maxRetries;
        this.axios = axios.create({
            baseURL: config.baseURL,
            timeout: config.timeoutMs,
            headers: { "User-Agent": config.userAgent },
            // Treat 3xx as errors so WakaTime's 302 throttle signal reaches the
            // retry logic instead of being silently followed.
            maxRedirects: 0,
        });

        this.axios.interceptors.request.use((request) => applyAuth(request, config.credential));
    }

    async request<T>(config: AxiosRequestConfig): Promise<T> {
        // POST is not idempotent: a retry after a lost response could create a
        // second heartbeat/duration/dump. Only retry idempotent methods.
        const method = (config.method ?? "GET").toUpperCase();
        const isIdempotent = method !== "POST";

        for (let attempt = 0; ; attempt++) {
            try {
                const response = await this.axios.request<T>(config);
                return response.data;
            } catch (error) {
                if (!isAxiosError(error)) {
                    throw error;
                }

                const mapped = mapErrorFromResponse(error);
                const status = error.response?.status;
                const isRetryable = isIdempotent && (status === undefined || isRetryableStatus(status));

                if (!isRetryable || attempt >= this.maxRetries) {
                    throw mapped;
                }

                const retryAfter = mapped instanceof WakatimeRateLimitError ? mapped.retryAfter : undefined;
                await delay(computeBackoffMs(attempt, retryAfter));
            }
        }
    }

    get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return this.request<T>({ ...config, method: "GET", url });
    }

    post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
        return this.request<T>({ ...config, method: "POST", url, data });
    }

    put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
        return this.request<T>({ ...config, method: "PUT", url, data });
    }

    delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return this.request<T>({ ...config, method: "DELETE", url });
    }
}
