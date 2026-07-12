import type { WakatimeConfig } from "./config.js";
import { resolveConfig } from "./config.js";
import { HttpClient } from "./http/httpClient.js";
import { AllTimeSinceTodayResource } from "./resources/allTimeSinceToday.js";
import { CommitsResource } from "./resources/commits.js";
import { CustomRulesResource } from "./resources/customRules.js";
import { DataDumpsResource } from "./resources/dataDumps.js";
import { DurationsResource } from "./resources/durations.js";
import { EditorsResource } from "./resources/editors.js";
import { ExternalDurationsResource } from "./resources/externalDurations.js";
import { GoalsResource } from "./resources/goals.js";
import { HeartbeatsResource } from "./resources/heartbeats.js";
import { InsightsResource } from "./resources/insights.js";
import { LeaderboardsResource } from "./resources/leaderboards.js";
import { LeadersResource } from "./resources/leaders.js";
import { MachineNamesResource } from "./resources/machineNames.js";
import { MetaResource } from "./resources/meta.js";
import { OrgsResource } from "./resources/orgs.js";
import { ProgramLanguagesResource } from "./resources/programLanguages.js";
import { ProjectsResource } from "./resources/projects.js";
import { StatsResource } from "./resources/stats.js";
import { StatusBarResource } from "./resources/statusBar.js";
import { SummariesResource } from "./resources/summaries.js";
import { UserAgentsResource } from "./resources/userAgents.js";
import { UsersResource } from "./resources/users.js";

// Entry point to the SDK. Construct once with credentials, then reach the API
// through the grouped resource properties (e.g. `client.stats.get(...)`).
export class WakatimeClient {
    readonly users: UsersResource;
    readonly stats: StatsResource;
    readonly summaries: SummariesResource;
    readonly allTimeSinceToday: AllTimeSinceTodayResource;
    readonly statusBar: StatusBarResource;
    readonly durations: DurationsResource;
    readonly externalDurations: ExternalDurationsResource;
    readonly heartbeats: HeartbeatsResource;
    readonly projects: ProjectsResource;
    readonly commits: CommitsResource;
    readonly goals: GoalsResource;
    readonly insights: InsightsResource;
    readonly leaders: LeadersResource;
    readonly leaderboards: LeaderboardsResource;
    readonly machineNames: MachineNamesResource;
    readonly userAgents: UserAgentsResource;
    readonly editors: EditorsResource;
    readonly programLanguages: ProgramLanguagesResource;
    readonly meta: MetaResource;
    readonly dataDumps: DataDumpsResource;
    readonly customRules: CustomRulesResource;
    readonly orgs: OrgsResource;

    constructor(config: WakatimeConfig) {
        const resolved = resolveConfig(config);
        const http = new HttpClient(resolved);

        this.users = new UsersResource(http);
        this.stats = new StatsResource(http);
        this.summaries = new SummariesResource(http);
        this.allTimeSinceToday = new AllTimeSinceTodayResource(http);
        this.statusBar = new StatusBarResource(http);
        this.durations = new DurationsResource(http);
        this.externalDurations = new ExternalDurationsResource(http);
        this.heartbeats = new HeartbeatsResource(http);
        this.projects = new ProjectsResource(http);
        this.commits = new CommitsResource(http);
        this.goals = new GoalsResource(http);
        this.insights = new InsightsResource(http);
        this.leaders = new LeadersResource(http);
        this.leaderboards = new LeaderboardsResource(http);
        this.machineNames = new MachineNamesResource(http);
        this.userAgents = new UserAgentsResource(http);
        this.editors = new EditorsResource(http);
        this.programLanguages = new ProgramLanguagesResource(http);
        this.meta = new MetaResource(http);
        this.dataDumps = new DataDumpsResource(http);
        this.customRules = new CustomRulesResource(http);
        this.orgs = new OrgsResource(http);
    }
}
