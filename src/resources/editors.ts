import type { DataEnvelope } from "../types/common.js";
import { BaseResource } from "./base.js";

export interface Editor {
    name: string;
    color?: string | null;
}

export class EditorsResource extends BaseResource {
    // GET /editors - all editors WakaTime has plugins for.
    async list(): Promise<Editor[]> {
        const response = await this.http.get<DataEnvelope<Editor[]>>("/editors");
        return response.data;
    }
}
