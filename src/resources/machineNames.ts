import type { DataEnvelope } from "../types/common.js";
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
    async list(options: MachineNamesOptions = {}): Promise<MachineName[]> {
        const response = await this.http.get<DataEnvelope<MachineName[]>>(
            `${this.userSegment(options.user)}/machine_names`,
        );
        return response.data;
    }
}
