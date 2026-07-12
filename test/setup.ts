import { afterAll, afterEach, beforeAll } from "vitest";

import { server } from "./msw/server.js";

// Any request without a matching handler is a test bug, so error rather than
// letting it hit the real network.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
