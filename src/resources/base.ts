import type { HttpClient } from "../http/httpClient.js";

// Shared base for all resource groups. Holds the HTTP client and resolves the
// `/users/:user` vs `/users/current` path segment that nearly every endpoint
// is scoped to.
export abstract class BaseResource {
    protected readonly http: HttpClient;

    constructor(http: HttpClient) {
        this.http = http;
    }

    // Defaults to the authenticated user when no explicit username/id is given.
    protected userSegment(user?: string): string {
        return `/users/${encodeURIComponent(user ?? "current")}`;
    }
}
