import type { DataEnvelope } from "../types/common.js";
import { toQueryParams } from "../util/query.js";
import { BaseResource } from "./base.js";
import type { Leader, LeaderboardType } from "./leaders.js";

export interface PrivateLeaderboard {
    id: string;
    name: string;
    members_count?: number;
    members_with_timezones_count?: number;
    can_delete?: boolean;
    can_edit?: boolean;
    has_available_seat?: boolean;
    time_range?: string;
    created_at?: string;
    modified_at?: string | null;
}

export interface BoardLeadersResponse {
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
    timeout?: number;
    writes_only?: boolean;
    modified_at?: string | null;
}

export interface LeaderboardsOptions {
    user?: string;
}

export interface BoardLeadersOptions extends LeaderboardsOptions {
    language?: string;
    countryCode?: string;
    // Defaults to "time".
    boardType?: LeaderboardType;
    page?: number;
}

export class LeaderboardsResource extends BaseResource {
    // GET /users/:user/leaderboards - private leaderboards the user belongs to.
    async list(options: LeaderboardsOptions = {}): Promise<PrivateLeaderboard[]> {
        const response = await this.http.get<DataEnvelope<PrivateLeaderboard[]>>(
            `${this.userSegment(options.user)}/leaderboards`,
        );
        return response.data;
    }

    // GET /users/:user/leaderboards/:board - leaders within one private board.
    async leaders(boardId: string, options: BoardLeadersOptions = {}): Promise<BoardLeadersResponse> {
        const { user, ...rest } = options;
        const path = `${this.userSegment(user)}/leaderboards/${encodeURIComponent(boardId)}`;
        return this.http.get<BoardLeadersResponse>(path, { params: toQueryParams(rest) });
    }
}
