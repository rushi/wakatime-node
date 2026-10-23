# wakatime-node

[![npm version](https://img.shields.io/npm/v/wakatime-node.svg)](https://www.npmjs.com/package/wakatime-node)

Typed TypeScript SDK for the [WakaTime REST API](https://wakatime.com/developers). It handles authentication, error mapping, retries, and pagination so you call `client.stats.get("last_7_days")` and get back a typed object instead of hand-rolling fetch requests.

- Full coverage of the WakaTime API (22 resource groups)
- Two auth modes: secret API key or OAuth 2.0 bearer token
- Typed responses and options for every endpoint
- Automatic retry of `GET`, `PUT`, and `DELETE` on rate limits (`429`), throttle redirects (`302`), and server errors (`5xx`)
- Paginated lists fetched in full, plus async iteration over commits
- Typed error hierarchy you can `catch` and narrow

## Installation

```bash
npm install wakatime-node
# or
pnpm add wakatime-node
```

Requires Node.js 20 or newer. The package is ESM-only.

## Usage

```ts
import { WakatimeClient } from "wakatime-node";

const wakatime = new WakatimeClient({ accessToken: process.env.WAKATIME_OAUTH_TOKEN });

const me = await wakatime.users.current();
const stats = await wakatime.stats.get("last_7_days");

console.log(me.username, stats.human_readable_total);
```

### Authenticating

Provide exactly one credential. Supplying both, or neither, throws a `WakatimeConfigError` at construction.

Use an OAuth 2.0 access token for apps, scripts, and integrations. WakaTime intends API keys for editor plugins that send coding activity. To call the API for your own account only, you can create a token at [wakatime.com/oauth](https://wakatime.com/oauth) without publishing an app.

```ts
// Secret API key (HTTP Basic). Server-side only, never ship it to a browser.
new WakatimeClient({ apiKey: "waka_..." });

// OAuth 2.0 access token, sent as `Authorization: Bearer <token>`.
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
await refreshToken({
    clientId: process.env.WAKATIME_CLIENT_ID!,
    clientSecret: process.env.WAKATIME_CLIENT_SECRET!,
    redirectUri: "https://your.app/callback",
    refreshToken: token.refresh_token!,
});
await revokeToken({ clientId: "...", clientSecret: "...", token: token.access_token });
```

Tokens from `responseType: "code"` last 100 years. Tokens from `responseType: "token"` last 12 hours. Each app can hold 8 active tokens per user, and creating a 9th revokes the oldest.

`revokeToken` accepts four targets alongside `clientId` and `clientSecret`. WakaTime returns `200` even when the token is already revoked or expired.

| Target                 | Revokes                                   |
| :--------------------- | :---------------------------------------- |
| `{ token }`            | One access or refresh token.              |
| `{ token, all: true }` | Every token of the user who owns `token`. |
| `{ userId }`           | Every token of that user.                 |
| `{ all: true }`        | Every token of every user of your app.    |

## Configuration

| Option                | Default                           | Description                                                                      |
| --------------------- | --------------------------------- | -------------------------------------------------------------------------------- |
| `apiKey`              |                                   | Secret API key. Mutually exclusive with `accessToken`.                           |
| `accessToken`         |                                   | OAuth 2.0 access token. Mutually exclusive with `apiKey`.                        |
| `useApiKeyQueryParam` | `false`                           | Send the API key as `?api_key=` instead of a Basic header. Ignored with OAuth.   |
| `baseURL`             | `https://api.wakatime.com/api/v1` | Override the API base URL, for example to route through a proxy.                 |
| `timeoutMs`           | `30000`                           | Per-request timeout in milliseconds.                                             |
| `maxRetries`          | `2`                               | Retries on `429`/`302`/`5xx` for `GET`, `PUT`, and `DELETE`. Set `0` to disable. |
| `userAgent`           | `wakatime-node/<version>`         | Value of the `User-Agent` request header.                                        |

The SDK never retries `POST`, because a retried create could duplicate heartbeats, durations, or data dumps.

## Resources

Every resource hangs off the client instance:

`users`, `stats`, `aggregatedStats`, `summaries`, `allTimeSinceToday`, `statusBar`, `durations`, `externalDurations`, `heartbeats`, `projects`, `commits`, `goals`, `insights`, `leaders`, `leaderboards`, `machineNames`, `userAgents`, `editors`, `programLanguages`, `meta`, `dataDumps`, `customRules`, `orgs`.

```ts
const projects = await wakatime.projects.list({ q: "sdk" });
const summary = await wakatime.summaries.list({ start: "2026-01-01", end: "2026-01-07" });
const today = await wakatime.statusBar.today();
```

### Pagination

`projects.list()`, `machineNames.list()`, and `userAgents.list()` walk every page and return the full array.

`commits` exposes an async iterator alongside the single-page `list`:

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

Every `WakatimeError` also carries the `method` and `url` of the failed request. The original axios error is attached as `cause`, with the `Authorization` header and `api_key` redacted.

Subclasses: `WakatimeValidationError` (400), `WakatimeAuthError` (401/403), `WakatimeNotFoundError` (404), `WakatimeRateLimitError` (429), `WakatimeServerError` (5xx), `WakatimeNetworkError` (no response), `WakatimeConfigError` (bad client options).

A `202` response (stats not yet up to date) resolves without throwing. The SDK returns the payload with `is_up_to_date` and `percent_calculated` so you can poll.

## Development

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Unit tests mock all HTTP with [MSW](https://mswjs.io) and run offline.

Functional tests hit the live WakaTime API and are read-only. They read `WAKATIME_OAUTH_TOKEN` and `WAKATIME_API_KEY` from the environment or a `.env.local` file at the repo root. Each suite runs once per credential you set, and skips when you set neither:

```bash
WAKATIME_OAUTH_TOKEN=waka_tok_... pnpm test:functional
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full contributor workflow.

## License

[MIT](./LICENSE)
