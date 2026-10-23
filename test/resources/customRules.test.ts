import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import type { CustomRuleInput } from "../../src/index.js";
import { BASE, makeClient } from "../helpers.js";
import { server } from "../msw/server.js";

const rule: CustomRuleInput = {
    action: "change",
    source: "project",
    operation: "equals",
    source_value: "old-name",
    destination: "project",
    destination_value: "new-name",
    priority: 1,
};

describe("custom rules resource", () => {
    it("puts the rule list as an array and returns changes with the job id", async () => {
        let body: unknown = null;
        server.use(
            http.put(`${BASE}/users/current/custom_rules`, async ({ request }) => {
                body = await request.json();
                return HttpResponse.json({
                    data: { changes: { added: [rule], removed: [], rearranged: [] }, job_id: "job1" },
                });
            }),
        );

        const result = await makeClient().customRules.update([rule]);

        expect(body).toEqual([rule]);
        expect(result.job_id).toBe("job1");
        expect(result.changes.added).toHaveLength(1);
    });

    it("sends job_id when checking progress", async () => {
        let jobId: string | null = null;
        server.use(
            http.get(`${BASE}/users/current/custom_rules_progress`, ({ request }) => {
                jobId = new URL(request.url).searchParams.get("job_id");
                return HttpResponse.json({ data: { progress: 40, job_id: "job1" } });
            }),
        );

        const progress = await makeClient().customRules.progress("job1");

        expect(jobId).toBe("job1");
        expect(progress.progress).toBe(40);
    });

    it("cancels the progress job with a DELETE", async () => {
        let called = false;
        server.use(
            http.delete(`${BASE}/users/current/custom_rules_progress`, () => {
                called = true;
                return HttpResponse.json({ data: {} });
            }),
        );

        await makeClient().customRules.cancelProgress();

        expect(called).toBe(true);
    });
});
