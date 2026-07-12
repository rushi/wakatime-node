import type { DataEnvelope } from "../types/common.js";
import { BaseResource } from "./base.js";

export interface WakatimeMeta {
    total_users?: number;
    total_teams?: number;
    total_hours_coded?: number;
    default_program_language_colors?: Record<string, string>;
    editor_colors?: Record<string, string>;
    os_colors?: Record<string, string>;
    category_colors?: Record<string, string>;
}

export class MetaResource extends BaseResource {
    // GET /meta - aggregate WakaTime metadata and default color mappings.
    async get(): Promise<WakatimeMeta> {
        const response = await this.http.get<DataEnvelope<WakatimeMeta>>("/meta");
        return response.data;
    }
}
