// WakaTime sometimes returns 302 instead of 429 as a "spread your requests
// out" signal, so it is retryable alongside rate limits and server errors.
export const isRetryableStatus = (status: number): boolean => {
    return status === 302 || status === 429 || status >= 500;
};

// Exponential backoff with jitter. A server-provided Retry-After (seconds)
// always wins so we honour WakaTime's own pacing hint.
export const computeBackoffMs = (attempt: number, retryAfterSeconds?: number): number => {
    if (retryAfterSeconds !== undefined && retryAfterSeconds > 0) {
        return retryAfterSeconds * 1000;
    }
    const exponentialMs = 2 ** attempt * 300;
    const jitterMs = Math.random() * 100;
    return exponentialMs + jitterMs;
};

export const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));
