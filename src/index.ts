// Public entry point for the wakatime-node SDK.

export { WakatimeClient } from "./client.js";
export { SDK_VERSION } from "./config.js";
export type { ResolvedConfig, WakatimeConfig } from "./config.js";

export {
    WakatimeAuthError,
    WakatimeConfigError,
    WakatimeError,
    WakatimeNetworkError,
    WakatimeNotFoundError,
    WakatimeRateLimitError,
    WakatimeServerError,
    WakatimeValidationError,
} from "./http/errors.js";

export type { Page } from "./http/pagination.js";
export { paginate } from "./http/pagination.js";

export type {
    DataEnvelope,
    DateRange,
    GranularEntry,
    Pagination,
    PaginatedDataEnvelope,
    StatsRange,
} from "./types/common.js";
export type { WakatimeScope } from "./types/scopes.js";

// OAuth 2.0 server-side helpers.
export { buildAuthorizeUrl, exchangeCode, refreshToken, revokeToken } from "./resources/oauth.js";
export type {
    AuthorizeUrlParams,
    ExchangeCodeParams,
    OAuthToken,
    RefreshTokenParams,
    RevokeTokenParams,
} from "./resources/oauth.js";

// Resource response and option types.
export type { AllTimeOptions, AllTimeSinceToday } from "./resources/allTimeSinceToday.js";
export type {
    Commit,
    CommitOptions,
    CommitProject,
    CommitsListOptions,
    CommitsResponse,
    SingleCommitResponse,
} from "./resources/commits.js";
export type { CustomRule, CustomRuleInput, CustomRulesOptions, CustomRulesProgress } from "./resources/customRules.js";
export type { CreateDataDumpOptions, DataDump, DataDumpsOptions, DataDumpType } from "./resources/dataDumps.js";
export type { Duration, DurationsOptions, DurationsResponse } from "./resources/durations.js";
export type { Editor } from "./resources/editors.js";
export type {
    BulkExternalDurationResult,
    BulkExternalDurationsResponse,
    ExternalDuration,
    ExternalDurationInput,
    ExternalDurationsListOptions,
    ExternalDurationsOptions,
    ExternalDurationsResponse,
} from "./resources/externalDurations.js";
export type { Goal, GoalChartEntry, GoalsOptions } from "./resources/goals.js";
export type {
    BulkHeartbeatResult,
    BulkHeartbeatsResponse,
    Heartbeat,
    HeartbeatInput,
    HeartbeatsOptions,
    HeartbeatsResponse,
} from "./resources/heartbeats.js";
export type { InsightsOptions, InsightType } from "./resources/insights.js";
export type {
    BoardLeadersOptions,
    BoardLeadersResponse,
    LeaderboardsOptions,
    PrivateLeaderboard,
} from "./resources/leaderboards.js";
export type { Leader, LeaderRunningTotal, LeadersOptions, LeadersResponse, LeaderUser } from "./resources/leaders.js";
export type { MachineName, MachineNamesOptions } from "./resources/machineNames.js";
export type { WakatimeMeta } from "./resources/meta.js";
export type { Dashboard, DashboardMember, DashboardSummariesOptions, Org, OrgsOptions } from "./resources/orgs.js";
export type { ProgramLanguage } from "./resources/programLanguages.js";
export type { Project, ProjectRepository, ProjectsOptions } from "./resources/projects.js";
export type { StatsBestDay, StatsOptions, WakatimeStats } from "./resources/stats.js";
export type { StatusBarOptions, StatusBarToday } from "./resources/statusBar.js";
export type {
    DailySummary,
    GrandTotal,
    SummariesOptions,
    SummariesResponse,
    SummariesTotals,
    SummaryRange,
} from "./resources/summaries.js";
export type { UserAgent, UserAgentsOptions } from "./resources/userAgents.js";
export type { WakatimeUser } from "./resources/users.js";
