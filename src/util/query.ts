import { snakeCase } from "lodash-es";

type QueryValue = string | number | boolean;

// Convert a camelCase options object into WakaTime's snake_case query params,
// dropping null/undefined so unset options never appear in the URL.
export const toQueryParams = <T extends object>(input: T): Record<string, QueryValue> => {
    const params: Record<string, QueryValue> = {};

    for (const [key, value] of Object.entries(input)) {
        // Only scalars belong in a query string; skip null/undefined and guard
        // against objects/arrays that axios would serialize unexpectedly.
        if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") {
            continue;
        }
        params[snakeCase(key)] = value;
    }

    return params;
};
