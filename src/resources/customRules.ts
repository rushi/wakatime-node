import type { DataEnvelope } from "../types/common.js";
import { BaseResource } from "./base.js";

export type CustomRuleAction = "change" | "delete";

export type CustomRuleOperation = "equals" | "contains" | "starts with" | "ends with";

export interface CustomRuleDestination {
    id?: string;
    // Heartbeat property to overwrite.
    destination: string;
    destination_value: string;
}

export interface CustomRule {
    id: string;
    action: CustomRuleAction;
    // Heartbeat property the rule matches on.
    source: string;
    operation: CustomRuleOperation;
    source_value: string;
    destinations: CustomRuleDestination[];
    // Unique execution order across the user's rules.
    priority: number;
    job_id?: string;
    created_at?: string;
    modified_at?: string | null;
}

// One rule in the PUT body. Pass `id` to update an existing rule.
export interface CustomRuleInput {
    id?: string;
    action: CustomRuleAction;
    source: string;
    operation: CustomRuleOperation;
    source_value: string;
    destination: string;
    destination_value: string;
    priority: number;
}

export interface CustomRuleChanges {
    added: unknown[];
    removed: unknown[];
    rearranged: unknown[];
}

export interface CustomRulesUpdateResult {
    changes: CustomRuleChanges;
    // Background job reapplying the rules to past stats; poll with `progress()`.
    job_id?: string;
}

export interface CustomRulesProgress {
    // 0 to 100.
    progress: number;
    job_id: string;
}

export interface CustomRulesOptions {
    user?: string;
}

export class CustomRulesResource extends BaseResource {
    // GET /users/:user/custom_rules - the user's custom rules.
    async list(options: CustomRulesOptions = {}): Promise<CustomRule[]> {
        const response = await this.http.get<DataEnvelope<CustomRule[]>>(
            `${this.userSegment(options.user)}/custom_rules`,
        );
        return response.data;
    }

    // PUT /users/:user/custom_rules - create or update rules.
    async update(rules: CustomRuleInput[], options: CustomRulesOptions = {}): Promise<CustomRulesUpdateResult> {
        const response = await this.http.put<DataEnvelope<CustomRulesUpdateResult>>(
            `${this.userSegment(options.user)}/custom_rules`,
            rules,
        );
        return response.data;
    }

    // DELETE /users/:user/custom_rules/:rule_id - remove one rule. Past stats
    // are not recalculated.
    async delete(ruleId: string, options: CustomRulesOptions = {}): Promise<void> {
        const path = `${this.userSegment(options.user)}/custom_rules/${encodeURIComponent(ruleId)}`;
        await this.http.delete<unknown>(path);
    }

    // GET /users/:user/custom_rules_progress - progress of the job that
    // reapplies rules to past stats.
    async progress(jobId: string, options: CustomRulesOptions = {}): Promise<CustomRulesProgress> {
        const response = await this.http.get<DataEnvelope<CustomRulesProgress>>(
            `${this.userSegment(options.user)}/custom_rules_progress`,
            { params: { job_id: jobId } },
        );
        return response.data;
    }

    // DELETE /users/:user/custom_rules_progress - abort reapplying rules to past
    // stats. Rules still apply to new heartbeats.
    async cancelProgress(options: CustomRulesOptions = {}): Promise<void> {
        await this.http.delete<unknown>(`${this.userSegment(options.user)}/custom_rules_progress`);
    }
}
