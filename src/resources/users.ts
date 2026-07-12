import type { DataEnvelope } from "../types/common.js";
import { BaseResource } from "./base.js";

export interface WakatimeUser {
    id: string;
    username: string | null;
    display_name?: string;
    full_name?: string | null;
    email?: string | null;
    photo?: string;
    is_email_public?: boolean;
    is_email_confirmed?: boolean;
    public_email?: string | null;
    photo_public?: boolean;
    timezone?: string | null;
    last_heartbeat_at?: string | null;
    last_plugin?: string | null;
    last_plugin_name?: string | null;
    last_project?: string | null;
    plan?: string;
    username_public?: boolean;
    website?: string | null;
    human_readable_website?: string | null;
    location?: string | null;
    logged_time_public?: boolean;
    languages_used_public?: boolean;
    created_at?: string;
    modified_at?: string | null;
}

export class UsersResource extends BaseResource {
    // GET /users/current - the authenticated user.
    async current(): Promise<WakatimeUser> {
        const response = await this.http.get<DataEnvelope<WakatimeUser>>(this.userSegment());
        return response.data;
    }

    // GET /users/:user - a specific user by username or id.
    async get(user: string): Promise<WakatimeUser> {
        const response = await this.http.get<DataEnvelope<WakatimeUser>>(this.userSegment(user));
        return response.data;
    }
}
