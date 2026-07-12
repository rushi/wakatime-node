import type { Page } from "../http/pagination.js";
import { paginate } from "../http/pagination.js";
import { toQueryParams } from "../util/query.js";
import { BaseResource } from "./base.js";
import type { ProjectRepository } from "./projects.js";

export interface Commit {
    id: string;
    hash: string;
    truncated_hash?: string;
    ref?: string;
    branch: string;
    message: string;
    author_name: string;
    author_username?: string;
    author_email?: string;
    author_date?: string;
    author_avatar_url?: string;
    author_html_url?: string;
    author_url?: string;
    committer_name?: string;
    committer_username?: string;
    committer_email?: string;
    committer_date?: string;
    committer_avatar_url?: string;
    committer_html_url?: string;
    committer_url?: string;
    human_readable_total?: string;
    human_readable_total_with_seconds?: string;
    total_seconds?: number;
    created_at?: string;
    html_url?: string;
    url?: string;
}

export interface CommitProject {
    id: string;
    name: string;
    privacy?: string;
    repository?: ProjectRepository | null;
    status?: string;
}

export interface CommitsResponse {
    commits: Commit[];
    project: CommitProject;
    branch?: string | null;
    author?: string | null;
    status?: string;
    total?: number;
    total_pages?: number;
    page?: number;
    next_page?: number | null;
    next_page_url?: string | null;
    prev_page?: number | null;
    prev_page_url?: string | null;
}

export interface SingleCommitResponse {
    commit: Commit;
    project: CommitProject;
    branch?: string | null;
}

export interface CommitsListOptions {
    user?: string;
    author?: string;
    branch?: string;
    page?: number;
}

export interface CommitOptions {
    user?: string;
    branch?: string;
}

export class CommitsResource extends BaseResource {
    // GET /users/:user/projects/:project/commits - one page of commits with the
    // time coded in each.
    async list(project: string, options: CommitsListOptions = {}): Promise<CommitsResponse> {
        const { user, ...rest } = options;
        const path = `${this.userSegment(user)}/projects/${encodeURIComponent(project)}/commits`;
        return this.http.get<CommitsResponse>(path, { params: toQueryParams(rest) });
    }

    // GET /users/:user/projects/:project/commits/:hash - a single commit.
    async get(project: string, hash: string, options: CommitOptions = {}): Promise<SingleCommitResponse> {
        const { user, ...rest } = options;
        const encodedProject = encodeURIComponent(project);
        const path = `${this.userSegment(user)}/projects/${encodedProject}/commits/${encodeURIComponent(hash)}`;
        return this.http.get<SingleCommitResponse>(path, { params: toQueryParams(rest) });
    }

    // Async-iterate every commit across all pages for a project.
    iterate(project: string, options: Omit<CommitsListOptions, "page"> = {}): AsyncGenerator<Commit, void, void> {
        return paginate<Commit>(async (page): Promise<Page<Commit>> => {
            const response = await this.list(project, { ...options, page });
            return {
                items: response.commits,
                pagination: {
                    page: response.page,
                    next_page: response.next_page,
                    next_page_url: response.next_page_url,
                    total_pages: response.total_pages,
                },
            };
        });
    }
}
