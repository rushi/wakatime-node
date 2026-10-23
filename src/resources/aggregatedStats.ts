import type { DataEnvelope } from "../types/common.js";
import { BaseResource } from "./base.js";

// `"last_7_days"` or a year since 2013 (`"2024"`).
export type AggregatedStatsRange = "last_7_days" | `${number}`;

// Distribution of one metric across all WakaTime users.
export interface AggregatedStatsMetric {
    average: number;
    count: number;
    max: number;
    median: number;
    sum: number;
}

// A named entry (language, editor, ...) with its own distribution.
export interface AggregatedStatsEntry extends Partial<AggregatedStatsMetric> {
    name: string;
}

export interface AggregatedStats {
    range: string;
    timeout?: number;
    writes_only?: boolean;
    total?: AggregatedStatsMetric;
    daily_average?: AggregatedStatsMetric;
    ai_coding?: AggregatedStatsMetric;
    ai_coding_daily_average?: AggregatedStatsMetric;
    manual_coding?: AggregatedStatsMetric;
    manual_coding_daily_average?: AggregatedStatsMetric;
    ai_line_changes?: AggregatedStatsMetric;
    human_line_changes?: AggregatedStatsMetric;
    ai_model_costs?: AggregatedStatsEntry[];
    categories?: AggregatedStatsEntry[];
    editors?: AggregatedStatsEntry[];
    languages?: AggregatedStatsEntry[];
    operating_systems?: AggregatedStatsEntry[];
}

export class AggregatedStatsResource extends BaseResource {
    // GET /stats/:range - stats aggregated across all WakaTime users.
    async get(range: AggregatedStatsRange): Promise<AggregatedStats> {
        const response = await this.http.get<DataEnvelope<AggregatedStats>>(`/stats/${range}`);
        return response.data;
    }
}
