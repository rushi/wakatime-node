import type { Pagination } from "../types/common.js";

// One page of a paginated list: its items plus WakaTime's paging metadata.
export interface Page<T> {
    items: T[];
    pagination: Pagination;
}

// Walk a paginated endpoint one page at a time, yielding items until WakaTime
// reports no further page. `fetchPage` runs the actual request for a page.
export async function* paginate<T>(
    fetchPage: (page: number) => Promise<Page<T>>,
    startPage = 1,
): AsyncGenerator<T, void, void> {
    let page = startPage;

    while (true) {
        const { items, pagination } = await fetchPage(page);
        for (const item of items) {
            yield item;
        }

        const nextPage = pagination.next_page;
        if (nextPage === null || nextPage === undefined) {
            return;
        }
        page = nextPage;
    }
}
