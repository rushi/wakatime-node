// Shared response shapes used across multiple WakaTime resources.

// A date range as returned inside most stats/summaries payloads. WakaTime is
// inconsistent about which fields it includes per endpoint, so all but the
// core ISO `start`/`end` are optional.
export interface DateRange {
    start: string;
    end: string;
    date?: string;
    text?: string;
    timezone?: string;
    name?: string;
    start_date?: string;
    start_text?: string;
    end_date?: string;
    end_text?: string;
}

// Pagination metadata attached to list responses (commits, some org endpoints).
export interface Pagination {
    page?: number | null | undefined;
    next_page?: number | null | undefined;
    next_page_url?: string | null | undefined;
    prev_page?: number | null | undefined;
    prev_page_url?: string | null | undefined;
    total?: number | null | undefined;
    total_pages?: number | null | undefined;
}

// Stats and insights range: a named range, a year (`"2025"`), or a month
// (`"2025-03"`).
export type StatsRange =
    "last_7_days" | "last_30_days" | "last_6_months" | "last_year" | "all_time" | `${number}` | `${number}-${number}`;

// A single grouped metric (language, editor, project, ...) as it appears in
// stats and summaries payloads.
export interface GranularEntry {
    name: string;
    total_seconds: number;
    percent: number;
    digital: string;
    text: string;
    hours: number;
    minutes: number;
    seconds?: number;
}

// Most endpoints wrap their payload in a top-level `data` key.
export interface DataEnvelope<T> {
    data: T;
}

// Some `data`-enveloped list endpoints (user agents, machine names, projects)
// also paginate, with the paging fields sitting alongside `data` rather than
// nested inside it.
export interface PaginatedDataEnvelope<T> extends DataEnvelope<T>, Pagination {}
