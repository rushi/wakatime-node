import type { DataEnvelope } from "../types/common.js";
import { BaseResource } from "./base.js";

export interface GoalChartEntry {
    actual_seconds: number;
    actual_seconds_text: string;
    goal_seconds: number;
    goal_seconds_text: string;
    range: {
        date: string;
        start: string;
        end: string;
        text: string;
        timezone: string;
    };
    range_status: string;
    range_status_reason?: string;
}

export interface Goal {
    id: string;
    title?: string;
    type: string;
    delta?: string;
    seconds?: number;
    status?: string;
    is_enabled?: boolean;
    is_snoozed?: boolean;
    is_inverse?: boolean;
    is_tweeting?: boolean;
    is_current_user_owner?: boolean;
    ignore_zero_days?: boolean;
    languages?: string[];
    projects?: string[];
    editors?: string[];
    cumulative_status?: string;
    average_status?: string;
    chart_data?: GoalChartEntry[];
    created_at?: string;
    modified_at?: string | null;
}

export interface GoalsOptions {
    user?: string;
}

export class GoalsResource extends BaseResource {
    // GET /users/:user/goals - the user's configured goals.
    async list(options: GoalsOptions = {}): Promise<Goal[]> {
        const response = await this.http.get<DataEnvelope<Goal[]>>(`${this.userSegment(options.user)}/goals`);
        return response.data;
    }

    // GET /users/:user/goals/:goal - a single goal with its chart data.
    async get(goalId: string, options: GoalsOptions = {}): Promise<Goal> {
        const path = `${this.userSegment(options.user)}/goals/${encodeURIComponent(goalId)}`;
        const response = await this.http.get<DataEnvelope<Goal>>(path);
        return response.data;
    }
}
