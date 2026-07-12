import type { DataEnvelope } from "../types/common.js";
import { BaseResource } from "./base.js";

export interface CustomRule {
    id: string;
    name?: string;
    language?: string | null;
    project?: string | null;
    entities?: string[];
    entities_type?: string;
    created_at?: string;
    modified_at?: string | null;
}

// Body accepted when creating/updating a custom rule via PUT. Fields mirror the
// rule object; supply what the rule should match on.
export interface CustomRuleInput {
    name?: string;
    language?: string;
    project?: string;
    entities?: string[];
    entities_type?: string;
}

export interface CustomRulesProgress {
    percent_calculated?: number;
    is_up_to_date?: boolean;
    status?: string;
}

export interface CustomRulesOptions {
    user?: string;
}

export class CustomRulesResource extends BaseResource {
    // GET /users/:user/custom_rules - the user's custom detection rules.
    async list(options: CustomRulesOptions = {}): Promise<CustomRule[]> {
        const response = await this.http.get<DataEnvelope<CustomRule[]>>(
            `${this.userSegment(options.user)}/custom_rules`,
        );
        return response.data;
    }

    // PUT /users/:user/custom_rules - create or update a custom rule.
    async upsert(rule: CustomRuleInput, options: CustomRulesOptions = {}): Promise<CustomRule> {
        const response = await this.http.put<DataEnvelope<CustomRule>>(
            `${this.userSegment(options.user)}/custom_rules`,
            rule,
        );
        return response.data;
    }

    // DELETE /users/:user/custom_rules/:rule_id - remove a custom rule.
    async delete(ruleId: string, options: CustomRulesOptions = {}): Promise<void> {
        const path = `${this.userSegment(options.user)}/custom_rules/${encodeURIComponent(ruleId)}`;
        await this.http.delete<unknown>(path);
    }

    // GET /users/:user/custom_rules_progress - recalculation progress.
    async progress(options: CustomRulesOptions = {}): Promise<CustomRulesProgress> {
        const response = await this.http.get<DataEnvelope<CustomRulesProgress>>(
            `${this.userSegment(options.user)}/custom_rules_progress`,
        );
        return response.data;
    }

    // DELETE /users/:user/custom_rules_progress - reset recalculation progress.
    async resetProgress(options: CustomRulesOptions = {}): Promise<void> {
        await this.http.delete<unknown>(`${this.userSegment(options.user)}/custom_rules_progress`);
    }
}
