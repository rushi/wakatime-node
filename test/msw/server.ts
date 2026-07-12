import { setupServer } from "msw/node";

// Shared MSW server for all unit tests. Individual tests register handlers
// with `server.use(...)`; unhandled requests fail loudly (see test/setup.ts).
export const server = setupServer();
