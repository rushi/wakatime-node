import type { Page } from "../http/pagination.js";
import { paginate } from "../http/pagination.js";
import type { PaginatedDataEnvelope } from "../types/common.js";
import { BaseResource } from "./base.js";

export interface UserAgent {
    id: string;
    value: string;
    editor?: string | null;
    version?: string | null;
    os?: string | null;
    last_seen_at?: string | null;
    created_at?: string;
    is_browser_extension?: boolean;
    is_desktop_app?: boolean;
}

export interface UserAgentsOptions {
    user?: string;
}

export class UserAgentsResource extends BaseResource {
    // GET /users/:user/user_agents - editor/plugin user agents seen for the
    // user. WakaTime paginates this endpoint, so we walk every page: callers
    // rely on `list()` returning the complete set, not just page one.
    async list(options: UserAgentsOptions = {}): Promise<UserAgent[]> {
        const items: UserAgent[] = [];
        for await (const item of paginate<UserAgent>((page) => this.fetchPage(options, page))) {
            items.push(item);
        }
        return items;
    }

    private async fetchPage(options: UserAgentsOptions, page: number): Promise<Page<UserAgent>> {
        const response = await this.http.get<PaginatedDataEnvelope<UserAgent[]>>(
            `${this.userSegment(options.user)}/user_agents`,
            { params: { page } },
        );
        return { items: response.data, pagination: response };
    }
}
