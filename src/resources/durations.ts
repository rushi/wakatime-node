import { toQueryParams } from "../util/query.js";
import { BaseResource } from "./base.js";

export interface Duration {
    project: string | null;
    time: number;
    duration: number;
    color?: string | null;
    branch?: string | null;
    entity?: string | null;
    type?: string | null;
    category?: string | null;
    language?: string | null;
    dependencies?: string[];
    machine_name_id?: string | null;
    user_agent_id?: string | null;
    is_debugging?: boolean;
}

export interface DurationsResponse {
    data: Duration[];
    start: string;
    end: string;
    timezone?: string;
    branches?: string[];
}

export interface DurationsOptions {
    user?: string;
    project?: string;
    branches?: string;
    timeout?: number;
    writesOnly?: boolean;
    timezone?: string;
    // Group adjacent durations by one of: entity, language, dependencies,
    // os, editor, category, or machine.
    sliceBy?: string;
}

export class DurationsResource extends BaseResource {
    // GET /users/:user/durations - a day's coding activity as continuous bars,
    // the shape editor timeline views use. `date` is required (YYYY-MM-DD).
    async list(date: string, options: DurationsOptions = {}): Promise<DurationsResponse> {
        const { user, ...rest } = options;
        const path = `${this.userSegment(user)}/durations`;
        return this.http.get<DurationsResponse>(path, { params: toQueryParams({ date, ...rest }) });
    }
}
