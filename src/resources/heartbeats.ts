import type { AxiosRequestConfig } from "axios";

import type { DataEnvelope } from "../types/common.js";
import { toQueryParams } from "../util/query.js";
import { BaseResource } from "./base.js";

export interface HeartbeatInput {
    // Absolute path to the file, or app/domain name.
    entity: string;
    type: "file" | "app" | "domain";
    // Unix epoch seconds (may be fractional).
    time: number;
    category?: string;
    project?: string;
    project_root_count?: number;
    branch?: string;
    language?: string;
    dependencies?: string[];
    lines?: number;
    // Lines added or removed by GenAI since the last heartbeat in this file.
    ai_line_changes?: number;
    // Lines added or removed by typing since the last heartbeat in this file.
    human_line_changes?: number;
    ai_session?: string;
    // GenAI usage since the last heartbeat.
    ai_input_tokens?: number;
    ai_output_tokens?: number;
    ai_prompt_length?: number;
    ai_subscription_plan?: string;
    lineno?: number;
    cursorpos?: number;
    is_write?: boolean;
}

export interface Heartbeat extends HeartbeatInput {
    id: string;
    user_id?: string;
    machine_name_id?: string | null;
    user_agent_id?: string | null;
    created_at?: string;
}

export interface HeartbeatsResponse {
    data: Heartbeat[];
    start: string;
    end: string;
    timezone?: string;
}

// One entry of a bulk insert response: the created heartbeat plus its own
// HTTP status, mirroring WakaTime's `responses: [[body, status], ...]` shape.
export type BulkHeartbeatResult = [DataEnvelope<Heartbeat> | { errors: string[] }, number];

export interface BulkHeartbeatsResponse {
    responses: BulkHeartbeatResult[];
}

export interface HeartbeatsOptions {
    user?: string;
    // Sent as the X-Machine-Name header so WakaTime attributes to a machine.
    machineName?: string;
}

export class HeartbeatsResource extends BaseResource {
    // GET /users/:user/heartbeats - raw heartbeats for a single day (YYYY-MM-DD).
    async list(date: string, options: Pick<HeartbeatsOptions, "user"> = {}): Promise<HeartbeatsResponse> {
        const path = `${this.userSegment(options.user)}/heartbeats`;
        return this.http.get<HeartbeatsResponse>(path, { params: toQueryParams({ date }) });
    }

    // POST /users/:user/heartbeats - record a single heartbeat.
    async create(heartbeat: HeartbeatInput, options: HeartbeatsOptions = {}): Promise<Heartbeat> {
        const path = `${this.userSegment(options.user)}/heartbeats`;
        const response = await this.http.post<DataEnvelope<Heartbeat>>(
            path,
            heartbeat,
            machineNameConfig(options.machineName),
        );
        return response.data;
    }

    // POST /users/:user/heartbeats.bulk - record many heartbeats in one call.
    async createBulk(heartbeats: HeartbeatInput[], options: HeartbeatsOptions = {}): Promise<BulkHeartbeatsResponse> {
        const path = `${this.userSegment(options.user)}/heartbeats.bulk`;
        return this.http.post<BulkHeartbeatsResponse>(path, heartbeats, machineNameConfig(options.machineName));
    }

    // DELETE /users/:user/heartbeats.bulk - delete heartbeats by id. Only ids
    // on `date` (YYYY-MM-DD, user's timezone) are deleted.
    async deleteBulk(date: string, ids: string[], options: Pick<HeartbeatsOptions, "user"> = {}): Promise<void> {
        const path = `${this.userSegment(options.user)}/heartbeats.bulk`;
        await this.http.delete<unknown>(path, { data: { date, ids } });
    }
}

const machineNameConfig = (machineName?: string): AxiosRequestConfig | undefined => {
    return machineName === undefined ? undefined : { headers: { "X-Machine-Name": machineName } };
};
