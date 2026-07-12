import type { DataEnvelope } from "../types/common.js";
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
    // GET /users/:user/user_agents - editor/plugin user agents seen for the user.
    async list(options: UserAgentsOptions = {}): Promise<UserAgent[]> {
        const response = await this.http.get<DataEnvelope<UserAgent[]>>(
            `${this.userSegment(options.user)}/user_agents`,
        );
        return response.data;
    }
}
