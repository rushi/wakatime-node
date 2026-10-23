import type { DataEnvelope } from "../types/common.js";
import { toQueryParams } from "../util/query.js";
import { BaseResource } from "./base.js";

export interface Editor {
    name: string;
    color?: string | null;
}

export interface EditorsOptions {
    unreleased?: boolean;
}

export class EditorsResource extends BaseResource {
    // GET /editors - all editors WakaTime has plugins for.
    async list(options: EditorsOptions = {}): Promise<Editor[]> {
        const response = await this.http.get<DataEnvelope<Editor[]>>("/editors", { params: toQueryParams(options) });
        return response.data;
    }
}
