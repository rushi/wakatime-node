import type { DataEnvelope, GranularEntry, StatsRange } from "../types/common.js";
import { toQueryParams } from "../util/query.js";
import { BaseResource } from "./base.js";

export interface StatsBestDay {
    date: string;
    text: string;
    total_seconds: number;
}

export interface WakatimeStats {
    username?: string;
    user_id?: string;
    range: string;
    start: string;
    end: string;
    timezone?: string;
    timeout?: number;
    writes_only?: boolean;
    total_seconds: number;
    daily_average: number;
    total_seconds_including_other_language?: number;
    daily_average_including_other_language?: number;
    human_readable_total?: string;
    human_readable_daily_average?: string;
    is_up_to_date: boolean;
    is_up_to_date_pending_future?: boolean;
    is_coding_activity_visible?: boolean;
    is_stuck?: boolean;
    percent_calculated?: number;
    best_day?: StatsBestDay | null;
    categories: GranularEntry[];
    projects: GranularEntry[];
    languages: GranularEntry[];
    editors: GranularEntry[];
    operating_systems: GranularEntry[];
    dependencies: GranularEntry[];
    machines: GranularEntry[];
}

export interface StatsOptions {
    // Target user; defaults to the authenticated user.
    user?: string;
    // Keystroke timeout setting (minutes) to compute the stats with.
    timeout?: number;
    // Only count time with edits, excluding time spent reading code.
    writesOnly?: boolean;
    // Limit stats to a single project.
    project?: string;
}

export class StatsResource extends BaseResource {
    // GET /users/:user/stats/:range - aggregate stats for a range. Omitting the
    // range hits /users/:user/stats (the user's default range).
    async get(range?: StatsRange, options: StatsOptions = {}): Promise<WakatimeStats> {
        const { user, ...rest } = options;
        const basePath = `${this.userSegment(user)}/stats`;
        const path = range ? `${basePath}/${range}` : basePath;
        const response = await this.http.get<DataEnvelope<WakatimeStats>>(path, { params: toQueryParams(rest) });
        return response.data;
    }
}
