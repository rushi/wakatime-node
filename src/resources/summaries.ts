import type { GranularEntry } from "../types/common.js";
import { toQueryParams } from "../util/query.js";
import { BaseResource } from "./base.js";

export interface SummaryRange {
    date: string;
    start: string;
    end: string;
    text: string;
    timezone: string;
}

export interface GrandTotal {
    hours: number;
    minutes: number;
    total_seconds: number;
    digital: string;
    decimal: string;
    text: string;
}

export interface DailySummary {
    range: SummaryRange;
    grand_total: GrandTotal;
    categories: GranularEntry[];
    projects: GranularEntry[];
    languages: GranularEntry[];
    editors: GranularEntry[];
    operating_systems: GranularEntry[];
    dependencies: GranularEntry[];
    machines: GranularEntry[];
}

export interface SummariesTotals {
    seconds: number;
    text: string;
    digital: string;
    decimal: string;
}

export interface SummariesResponse {
    data: DailySummary[];
    start: string;
    end: string;
    cumulative_total?: SummariesTotals & { seconds_including_other_language?: number };
    daily_average?: SummariesTotals & { days_including_holidays?: number; days_minus_holidays?: number };
}

export type SummariesNamedRange =
    | "Today"
    | "Yesterday"
    | "Last 7 Days"
    | "Last 7 Days from Yesterday"
    | "Last 14 Days"
    | "Last 30 Days"
    | "This Week"
    | "Last Week"
    | "This Month"
    | "Last Month";

export interface SummariesOptions {
    user?: string;
    // Explicit date window (YYYY-MM-DD). Required unless `range` is given.
    start?: string;
    end?: string;
    // Named range alternative to start/end.
    range?: SummariesNamedRange;
    project?: string;
    branches?: string;
    timeout?: number;
    writesOnly?: boolean;
    timezone?: string;
}

export class SummariesResource extends BaseResource {
    // GET /users/:user/summaries - per-day coding activity over a date window.
    // Returns the full envelope since it carries cumulative/average metadata
    // alongside the daily `data` array.
    async list(options: SummariesOptions = {}): Promise<SummariesResponse> {
        const { user, ...rest } = options;
        const path = `${this.userSegment(user)}/summaries`;
        return this.http.get<SummariesResponse>(path, { params: toQueryParams(rest) });
    }
}
