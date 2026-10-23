import type { DataEnvelope } from "../types/common.js";
import { toQueryParams } from "../util/query.js";
import { BaseResource } from "./base.js";
import type { CustomRule, CustomRuleChanges, CustomRuleDestination } from "./customRules.js";
import type { DurationsResponse, DurationsSliceBy } from "./durations.js";
import type { SummariesNamedRange, SummariesResponse } from "./summaries.js";

export interface Org {
    id: string;
    name: string;
    is_active?: boolean;
    is_paid?: boolean;
    is_current_user_owner?: boolean;
    people_count?: number;
    created_at?: string;
    modified_at?: string | null;
}

export interface Dashboard {
    id: string;
    name: string;
    is_active?: boolean;
    members_count?: number;
    is_current_user_owner?: boolean;
    created_at?: string;
    modified_at?: string | null;
}

export interface DashboardMember {
    id: string;
    user_id?: string;
    username?: string | null;
    full_name?: string | null;
    email?: string | null;
    photo?: string | null;
    is_active?: boolean;
    is_view_only?: boolean;
    is_admin?: boolean;
    is_owner?: boolean;
}

export interface OrgsOptions {
    user?: string;
}

export interface DashboardSummariesOptions extends OrgsOptions {
    project?: string;
    // Comma-separated branch names.
    branches?: string;
}

// Pass either `start` and `end` (YYYY-MM-DD) or `range`.
export interface MemberSummariesOptions extends DashboardSummariesOptions {
    start?: string;
    end?: string;
    range?: SummariesNamedRange;
}

export interface OrgDurationsOptions extends DashboardSummariesOptions {
    sliceBy?: DurationsSliceBy;
}

export type OrgCustomRule = Omit<CustomRule, "id" | "job_id" | "created_at" | "modified_at">;

export interface OrgCustomRuleInput extends Omit<OrgCustomRule, "destinations"> {
    destinations: Omit<CustomRuleDestination, "id">[];
}

export interface OrgCustomRulesUpdateResult {
    changes: CustomRuleChanges;
}

export class OrgsResource extends BaseResource {
    // GET /users/:user/orgs - organizations the user belongs to.
    async list(options: OrgsOptions = {}): Promise<Org[]> {
        const response = await this.http.get<DataEnvelope<Org[]>>(`${this.userSegment(options.user)}/orgs`);
        return response.data;
    }

    // GET /users/:user/orgs/:org/dashboards - dashboards within an org.
    async dashboards(orgId: string, options: OrgsOptions = {}): Promise<Dashboard[]> {
        const response = await this.http.get<DataEnvelope<Dashboard[]>>(
            `${this.orgSegment(options.user, orgId)}/dashboards`,
        );
        return response.data;
    }

    // GET /users/:user/orgs/:org/dashboards/:dashboard/members
    async dashboardMembers(orgId: string, dashboardId: string, options: OrgsOptions = {}): Promise<DashboardMember[]> {
        const response = await this.http.get<DataEnvelope<DashboardMember[]>>(
            `${this.dashboardSegment(options.user, orgId, dashboardId)}/members`,
        );
        return response.data;
    }

    // GET /users/:user/orgs/:org/dashboards/:dashboard/summaries - one day
    // (YYYY-MM-DD) for the whole dashboard.
    async dashboardSummaries(
        orgId: string,
        dashboardId: string,
        date: string,
        options: DashboardSummariesOptions = {},
    ): Promise<SummariesResponse> {
        const { user, ...rest } = options;
        const path = `${this.dashboardSegment(user, orgId, dashboardId)}/summaries`;
        return this.http.get<SummariesResponse>(path, { params: toQueryParams({ date, ...rest }) });
    }

    // GET /users/:user/orgs/:org/dashboards/:dashboard/durations
    async dashboardDurations(
        orgId: string,
        dashboardId: string,
        date: string,
        options: OrgDurationsOptions = {},
    ): Promise<DurationsResponse> {
        const { user, ...rest } = options;
        const path = `${this.dashboardSegment(user, orgId, dashboardId)}/durations`;
        return this.http.get<DurationsResponse>(path, { params: toQueryParams({ date, ...rest }) });
    }

    // GET /users/:user/orgs/:org/dashboards/:dashboard/members/:member/summaries
    async memberSummaries(
        orgId: string,
        dashboardId: string,
        memberId: string,
        options: MemberSummariesOptions,
    ): Promise<SummariesResponse> {
        const { user, ...rest } = options;
        const path = `${this.memberSegment(user, orgId, dashboardId, memberId)}/summaries`;
        return this.http.get<SummariesResponse>(path, { params: toQueryParams(rest) });
    }

    // GET /users/:user/orgs/:org/dashboards/:dashboard/members/:member/durations
    async memberDurations(
        orgId: string,
        dashboardId: string,
        memberId: string,
        date: string,
        options: OrgDurationsOptions = {},
    ): Promise<DurationsResponse> {
        const { user, ...rest } = options;
        const path = `${this.memberSegment(user, orgId, dashboardId, memberId)}/durations`;
        return this.http.get<DurationsResponse>(path, { params: toQueryParams({ date, ...rest }) });
    }

    // GET /users/:user/orgs/:org/custom_rules
    async customRules(orgId: string, options: OrgsOptions = {}): Promise<OrgCustomRule[]> {
        const response = await this.http.get<DataEnvelope<OrgCustomRule[]>>(
            `${this.orgSegment(options.user, orgId)}/custom_rules`,
        );
        return response.data;
    }

    // PUT /users/:user/orgs/:org/custom_rules - create or update org rules.
    // Org rules merge with each member's own custom rules.
    async updateCustomRules(
        orgId: string,
        rules: OrgCustomRuleInput[],
        options: OrgsOptions = {},
    ): Promise<OrgCustomRulesUpdateResult> {
        const response = await this.http.put<DataEnvelope<OrgCustomRulesUpdateResult>>(
            `${this.orgSegment(options.user, orgId)}/custom_rules`,
            rules,
        );
        return response.data;
    }

    private orgSegment(user: string | undefined, orgId: string): string {
        return `${this.userSegment(user)}/orgs/${encodeURIComponent(orgId)}`;
    }

    private dashboardSegment(user: string | undefined, orgId: string, dashboardId: string): string {
        return `${this.orgSegment(user, orgId)}/dashboards/${encodeURIComponent(dashboardId)}`;
    }

    private memberSegment(user: string | undefined, orgId: string, dashboardId: string, memberId: string): string {
        return `${this.dashboardSegment(user, orgId, dashboardId)}/members/${encodeURIComponent(memberId)}`;
    }
}
