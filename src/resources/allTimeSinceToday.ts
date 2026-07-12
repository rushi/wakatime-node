import type { DataEnvelope, DateRange } from "../types/common.js";
import { toQueryParams } from "../util/query.js";
import { BaseResource } from "./base.js";

export interface AllTimeSinceToday {
    total_seconds: number;
    text: string;
    decimal?: string;
    digital?: string;
    daily_average?: number;
    is_up_to_date: boolean;
    percent_calculated?: number;
    range: DateRange;
    timeout?: number;
}

export interface AllTimeOptions {
    user?: string;
    // Scope the total to a single project (since that project was created).
    project?: string;
}

export class AllTimeSinceTodayResource extends BaseResource {
    // GET /users/:user/all_time_since_today - total time since account creation,
    // available even on free accounts.
    async get(options: AllTimeOptions = {}): Promise<AllTimeSinceToday> {
        const { user, ...rest } = options;
        const path = `${this.userSegment(user)}/all_time_since_today`;
        const response = await this.http.get<DataEnvelope<AllTimeSinceToday>>(path, { params: toQueryParams(rest) });
        return response.data;
    }
}
