import type { DataEnvelope } from "../types/common.js";
import { BaseResource } from "./base.js";

export interface ProgramLanguage {
    id: string;
    name: string;
    color?: string | null;
    is_verified?: boolean;
    created_at?: string;
}

export class ProgramLanguagesResource extends BaseResource {
    // GET /program_languages - every programming language WakaTime recognises.
    async list(): Promise<ProgramLanguage[]> {
        const response = await this.http.get<DataEnvelope<ProgramLanguage[]>>("/program_languages");
        return response.data;
    }
}
