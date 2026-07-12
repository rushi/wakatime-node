## wakatime-node

Typed TypeScript SDK for the [WakaTime REST API](https://wakatime.com/developers). It handles authentication, error mapping, retries, and pagination so you call `client.stats.get("last_7_days")` and get back a typed object instead of hand-rolling fetch requests.

API reference: https://wakatime.com/developers

- Full coverage of the WakaTime API (~40 resources)
- Two auth modes: secret API key or OAuth 2.0 bearer token
- Typed responses and options for every endpoint
- Automatic retry on rate limits (`429`), throttle redirects (`302`), and server errors (`5xx`)
- Async iteration over paginated endpoints (commits)
- Typed error hierarchy you can `catch` and narrow

## Installation

```bash
pnpm add wakatime-node
```

Requires Node.js 20 or newer. The package is ESM-only.

## Usage

```ts
import { WakatimeClient } from "wakatime-node";

const wakatime = new WakatimeClient({ apiKey: process.env.WAKATIME_API_KEY });

const me = await wakatime.users.current();
const stats = await wakatime.stats.get("last_7_days");

console.log(me.username, stats.human_readable_total);
```

### Authenticating

Provide exactly one credential. Supplying both, or neither, throws a `WakatimeConfigError` at construction.

```ts
// Secret API key (HTTP Basic). Server-side only, never ship it to a browser.
new WakatimeClient({ apiKey: "waka_..." });

// OAuth 2.0 access token.
new WakatimeClient({ accessToken: "waka_tok_..." });
```

### OAuth 2.0 flow

Server-side helpers cover the authorize, token, and revoke steps.

```ts
import { buildAuthorizeUrl, exchangeCode, refreshToken, revokeToken } from "wakatime-node";

// 1. Redirect the user to the authorize URL.
const url = buildAuthorizeUrl({
    clientId: process.env.WAKATIME_CLIENT_ID!,
    redirectUri: "https://your.app/callback",
    scopes: ["email", "read_stats.languages"],
    state: "csrf-token",
});

// 2. Exchange the returned `code` for tokens.
const token = await exchangeCode({
    clientId: process.env.WAKATIME_CLIENT_ID!,
    clientSecret: process.env.WAKATIME_CLIENT_SECRET!,
    redirectUri: "https://your.app/callback",
    code: "code-from-callback",
});

const client = new WakatimeClient({ accessToken: token.access_token });

// 3. Refresh when the access token expires, or revoke on disconnect.
await refreshToken({/* clientId, clientSecret, redirectUri, refreshToken */} as never);
await revokeToken({ clientId: "...", clientSecret: "...", token: token.access_token });
```

## Configuration

```ts
new WakatimeClient({
    apiKey: "waka_...", // or accessToken
    useApiKeyQueryParam: false, // send key as ?api_key= instead of a Basic header
    baseURL: undefined, // override the API base URL (e.g. a proxy)
    timeoutMs: 30_000, // per-request timeout
    maxRetries: 2, // retries on 429/302/5xx; set 0 to disable
    userAgent: undefined, // custom User-Agent header
});
```

## Resources

Every resource hangs off the client instance:

`users`, `stats`, `summaries`, `allTimeSinceToday`, `statusBar`, `durations`, `externalDurations`, `heartbeats`, `projects`, `commits`, `goals`, `insights`, `leaders`, `leaderboards`, `machineNames`, `userAgents`, `editors`, `programLanguages`, `meta`, `dataDumps`, `customRules`, `orgs`.

```ts
const projects = await wakatime.projects.list({ q: "sdk" });
const summary = await wakatime.summaries.list({ start: "2026-01-01", end: "2026-01-07" });
const today = await wakatime.statusBar.today();
```

### Pagination

Paginated endpoints expose an async iterator alongside single-page `list`:

```ts
for await (const commit of wakatime.commits.iterate("my-project")) {
    console.log(commit.hash, commit.human_readable_total);
}
```

### Error handling

All failures throw a subclass of `WakatimeError`, so a single `catch` covers everything and you can narrow by type:

```ts
import { WakatimeError, WakatimeRateLimitError } from "wakatime-node";

try {
    await wakatime.stats.get("last_7_days");
} catch (error) {
    if (error instanceof WakatimeRateLimitError) {
        console.warn(`Rate limited, retry after ${error.retryAfter}s`);
    } else if (error instanceof WakatimeError) {
        console.error(error.statusCode, error.apiErrors);
    }
}
```

Subclasses: `WakatimeValidationError` (400), `WakatimeAuthError` (401/403), `WakatimeNotFoundError` (404), `WakatimeRateLimitError` (429), `WakatimeServerError` (5xx), `WakatimeNetworkError` (no response), `WakatimeConfigError` (bad client options).

A `202` response (stats not yet up to date) is not an error; the payload is returned with `is_up_to_date` and `percent_calculated` so you can poll.

## Development

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

Unit tests mock all HTTP with [MSW](https://mswjs.io) and run offline.
