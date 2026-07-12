import type { GranularEntry } from "../types/common.js";
import { BaseResource } from "./base.js";
import type { GrandTotal, SummaryRange } from "./summaries.js";

export interface StatusBarToday {
    cached_at?: string;
    grand_total: GrandTotal;
    range: SummaryRange;
    categories: GranularEntry[];
    projects: GranularEntry[];
    languages: GranularEntry[];
    editors: GranularEntry[];
    operating_systems: GranularEntry[];
    dependencies: GranularEntry[];
    machines: GranularEntry[];
}

interface StatusBarResponse {
    data: StatusBarToday;
    cached_at?: string;
}

export interface StatusBarOptions {
    user?: string;
}

export class StatusBarResource extends BaseResource {
    // GET /users/:user/status_bar/today - today's coding activity, the same
    // payload editor plugins show in their status bar.
    async today(options: StatusBarOptions = {}): Promise<StatusBarToday> {
        const path = `${this.userSegment(options.user)}/status_bar/today`;
        const response = await this.http.get<StatusBarResponse>(path);
        // WakaTime nests the summary under `data` and exposes `cached_at` at the
        // top level; surface a single flat object with cached_at when present.
        const cachedAt = response.data.cached_at ?? response.cached_at;
        return cachedAt === undefined ? response.data : { ...response.data, cached_at: cachedAt };
    }
}
