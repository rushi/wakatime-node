import type { DataEnvelope } from "../types/common.js";
import { toQueryParams } from "../util/query.js";
import { BaseResource } from "./base.js";

export interface ExternalDurationInput {
    // Unique id in the external app; lets WakaTime dedupe on re-send.
    external_id: string;
    entity: string;
    type: string;
    category?: string;
    // Unix epoch seconds.
    start_time: number;
    end_time: number;
    project?: string;
    branch?: string;
    language?: string;
    meta?: string;
}

export interface ExternalDuration extends ExternalDurationInput {
    id: string;
    user_id?: string;
    created_at?: string;
}

export interface ExternalDurationsResponse {
    data: ExternalDuration[];
    start: string;
    end: string;
    timezone?: string;
}

export type BulkExternalDurationResult = [DataEnvelope<ExternalDuration> | { errors: string[] }, number];

export interface BulkExternalDurationsResponse {
    responses: BulkExternalDurationResult[];
}

export interface ExternalDurationsOptions {
    user?: string;
}

export interface ExternalDurationsListOptions extends ExternalDurationsOptions {
    project?: string;
    branches?: string;
    timezone?: string;
}

export class ExternalDurationsResource extends BaseResource {
    // GET /users/:user/external_durations - external durations for a day.
    async list(date: string, options: ExternalDurationsListOptions = {}): Promise<ExternalDurationsResponse> {
        const { user, ...rest } = options;
        const path = `${this.userSegment(user)}/external_durations`;
        return this.http.get<ExternalDurationsResponse>(path, { params: toQueryParams({ date, ...rest }) });
    }

    // POST /users/:user/external_durations - record one external duration.
    async create(duration: ExternalDurationInput, options: ExternalDurationsOptions = {}): Promise<ExternalDuration> {
        const path = `${this.userSegment(options.user)}/external_durations`;
        const response = await this.http.post<DataEnvelope<ExternalDuration>>(path, duration);
        return response.data;
    }

    // POST /users/:user/external_durations.bulk - record many at once.
    async createBulk(
        durations: ExternalDurationInput[],
        options: ExternalDurationsOptions = {},
    ): Promise<BulkExternalDurationsResponse> {
        const path = `${this.userSegment(options.user)}/external_durations.bulk`;
        return this.http.post<BulkExternalDurationsResponse>(path, durations);
    }

    // DELETE /users/:user/external_durations.bulk - delete by external id.
    async deleteBulk(externalIds: string[], options: ExternalDurationsOptions = {}): Promise<void> {
        const path = `${this.userSegment(options.user)}/external_durations.bulk`;
        await this.http.delete<unknown>(path, { data: externalIds });
    }
}
