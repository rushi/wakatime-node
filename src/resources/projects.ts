import type { Page } from "../http/pagination.js";
import { paginate } from "../http/pagination.js";
import type { PaginatedDataEnvelope } from "../types/common.js";
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
    // WakaTime paginates this endpoint (20/page), so we walk every page:
    // callers rely on `list()` returning the complete set, not just page one.
    async list(options: ProjectsOptions = {}): Promise<Project[]> {
        const items: Project[] = [];
        for await (const item of paginate<Project>((page) => this.fetchPage(options, page))) {
            items.push(item);
        }
        return items;
    }

    private async fetchPage(options: ProjectsOptions, page: number): Promise<Page<Project>> {
        const { user, ...rest } = options;
        const path = `${this.userSegment(user)}/projects`;
        const response = await this.http.get<PaginatedDataEnvelope<Project[]>>(path, {
            params: { ...toQueryParams(rest), page },
        });
        return { items: response.data, pagination: response };
    }
}
