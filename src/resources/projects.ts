import type { DataEnvelope } from "../types/common.js";
import { toQueryParams } from "../util/query.js";
import { BaseResource } from "./base.js";

export interface ProjectRepository {
    id: string;
    name: string;
    provider: string;
    url: string;
    default_branch?: string;
    private?: boolean;
    last_synced_at?: string | null;
    star_count?: number;
    watch_count?: number;
}

export interface Project {
    id: string;
    name: string;
    urlencoded_name?: string;
    url?: string;
    has_public_url?: boolean;
    human_readable_last_heartbeat_at?: string | null;
    last_heartbeat_at?: string | null;
    created_at?: string;
    repository?: ProjectRepository | null;
    badge?: string | null;
    clients?: string[];
}

export interface ProjectsOptions {
    user?: string;
    // Search term to filter projects by name.
    q?: string;
}

export class ProjectsResource extends BaseResource {
    // GET /users/:user/projects - projects WakaTime has tracked for the user.
    async list(options: ProjectsOptions = {}): Promise<Project[]> {
        const { user, ...rest } = options;
        const path = `${this.userSegment(user)}/projects`;
        const response = await this.http.get<DataEnvelope<Project[]>>(path, { params: toQueryParams(rest) });
        return response.data;
    }
}
