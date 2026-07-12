import { toQueryParams } from "../util/query.js";
import { BaseResource } from "./base.js";

export interface LeaderRunningTotal {
    total_seconds: number;
    human_readable_total: string;
    daily_average: number;
    human_readable_daily_average: string;
    languages?: { name: string; total_seconds: number }[];
}

export interface LeaderUser {
    id: string;
    username: string | null;
    display_name?: string;
    full_name?: string | null;
    email?: string | null;
    photo?: string;
    is_hireable?: boolean;
    city?: { country_code?: string; name?: string; title?: string } | null;
}

export interface Leader {
    rank: number;
    running_total: LeaderRunningTotal;
    user: LeaderUser;
}

export interface LeadersResponse {
    current_user?: Leader | null;
    data: Leader[];
    page: number;
    total_pages: number;
    range: {
        start_date: string;
        start_text: string;
        end_date: string;
        end_text: string;
        name: string;
        text: string;
    };
    language?: string | null;
    is_hireable?: boolean;
    timeout?: number;
    writes_only?: boolean;
    modified_at?: string | null;
}

export interface LeadersOptions {
    // Filter to a single language leaderboard.
    language?: string;
    // Two-letter country code to scope the board.
    countryCode?: string;
    // Only include developers open to being hired.
    isHireable?: boolean;
    page?: number;
}

export class LeadersResource extends BaseResource {
    // GET /leaders - the public global leaderboard.
    async get(options: LeadersOptions = {}): Promise<LeadersResponse> {
        return this.http.get<LeadersResponse>("/leaders", { params: toQueryParams(options) });
    }
}
