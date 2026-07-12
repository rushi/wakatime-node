import type { StatsRange } from "../types/common.js";
import { toQueryParams } from "../util/query.js";
import { BaseResource } from "./base.js";

// Insight categories WakaTime can compute. The shape of each insight's `data`
// differs, so callers pass a type argument for the payload they expect.
export type InsightType =
    | "weekday"
    | "days"
    | "best_day"
    | "daily_average"
    | "languages"
    | "editors"
    | "projects"
    | "operating_systems"
    | "machines"
    | "categories"
    | "dependencies";

export interface InsightsOptions {
    user?: string;
    timeout?: number;
    writesOnly?: boolean;
    weekday?: number;
}

export class InsightsResource extends BaseResource {
    // GET /users/:user/insights/:insight_type/:range - a computed insight.
    // Payload shape varies per insight_type, so `T` types the returned `data`.
    async get<T = unknown>(insightType: InsightType, range: StatsRange, options: InsightsOptions = {}): Promise<T> {
        const { user, ...rest } = options;
        const path = `${this.userSegment(user)}/insights/${insightType}/${range}`;
        const response = await this.http.get<{ data: T }>(path, { params: toQueryParams(rest) });
        return response.data;
    }
}
