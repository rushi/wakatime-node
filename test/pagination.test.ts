import { describe, expect, it } from "vitest";

import { paginate } from "../src/index.js";
import type { Page } from "../src/index.js";

describe("paginate", () => {
    it("walks pages until next_page is null and yields every item", async () => {
        const pages: Record<number, Page<number>> = {
            1: { items: [1, 2], pagination: { page: 1, next_page: 2, total_pages: 3 } },
            2: { items: [3, 4], pagination: { page: 2, next_page: 3, total_pages: 3 } },
            3: { items: [5], pagination: { page: 3, next_page: null, total_pages: 3 } },
        };
        const requested: number[] = [];

        const collected: number[] = [];
        for await (const item of paginate<number>((page) => {
            requested.push(page);
            return Promise.resolve(pages[page] as Page<number>);
        })) {
            collected.push(item);
        }

        expect(collected).toEqual([1, 2, 3, 4, 5]);
        expect(requested).toEqual([1, 2, 3]);
    });

    it("stops after a single page when there is no next_page", async () => {
        const collected: string[] = [];
        for await (const item of paginate<string>(() =>
            Promise.resolve({ items: ["only"], pagination: { page: 1, next_page: undefined } }),
        )) {
            collected.push(item);
        }

        expect(collected).toEqual(["only"]);
    });
});
