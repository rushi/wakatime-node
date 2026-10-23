import type { DataEnvelope } from "../types/common.js";
import { BaseResource } from "./base.js";

export type DataDumpType = "heartbeats" | "daily";

export interface DataDump {
    id: string;
    type: DataDumpType | string;
    status: string;
    percent_complete?: number;
    download_url?: string | null;
    has_failed?: boolean;
    is_processing?: boolean;
    is_stuck?: boolean;
    expires?: string | null;
    created_at?: string;
}

export interface DataDumpsOptions {
    user?: string;
}

export interface CreateDataDumpOptions extends DataDumpsOptions {
    // Email the user when the export is ready. The API defaults to true.
    emailWhenFinished?: boolean;
}

export class DataDumpsResource extends BaseResource {
    // GET /users/:user/data_dumps - export jobs and their progress.
    async list(options: DataDumpsOptions = {}): Promise<DataDump[]> {
        const response = await this.http.get<DataEnvelope<DataDump[]>>(`${this.userSegment(options.user)}/data_dumps`);
        return response.data;
    }

    // POST /users/:user/data_dumps - request a new export.
    async create(type: DataDumpType, options: CreateDataDumpOptions = {}): Promise<DataDump> {
        const path = `${this.userSegment(options.user)}/data_dumps`;
        const body = { type, email_when_finished: options.emailWhenFinished ?? true };
        const response = await this.http.post<DataEnvelope<DataDump>>(path, body);
        return response.data;
    }
}
