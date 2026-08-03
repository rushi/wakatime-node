import type { Page } from "../http/pagination.js";
import { paginate } from "../http/pagination.js";
import type { PaginatedDataEnvelope } from "../types/common.js";
import { BaseResource } from "./base.js";

export interface MachineName {
    id: string;
    name: string;
    value: string;
    ips?: string[];
    last_seen_at?: string | null;
    created_at?: string;
}

export interface MachineNamesOptions {
    user?: string;
}

export class MachineNamesResource extends BaseResource {
    // GET /users/:user/machine_names - machines that have sent heartbeats.
    // WakaTime paginates this endpoint, so we walk every page: callers rely
    // on `list()` returning the complete set, not just page one.
    async list(options: MachineNamesOptions = {}): Promise<MachineName[]> {
        const items: MachineName[] = [];
        for await (const item of paginate<MachineName>((page) => this.fetchPage(options, page))) {
            items.push(item);
        }
        return items;
    }

    private async fetchPage(options: MachineNamesOptions, page: number): Promise<Page<MachineName>> {
        const response = await this.http.get<PaginatedDataEnvelope<MachineName[]>>(
            `${this.userSegment(options.user)}/machine_names`,
            { params: { page } },
        );
        return { items: response.data, pagination: response };
    }
}
