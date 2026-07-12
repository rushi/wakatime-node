# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm build            # bundle ESM + .d.ts to dist/ via tsup
pnpm typecheck        # tsc --noEmit (strict)
pnpm lint             # eslint (flat config)
pnpm format           # prettier --write (4-space, double quotes, width 120)
pnpm test             # vitest run - offline unit suite (MSW-mocked)
pnpm test:watch       # vitest watch
pnpm test:functional  # live API suite (see below)
```

Run a single unit test file or name:

```bash
pnpm test test/resources/stats.test.ts
pnpm test -t "retries a 429"
```

The functional suite hits the real WakaTime API and is read-only. It reads `WAKATIME_API_KEY` from the environment or a repo-root `.env.local`, and self-skips when absent. Its config (`vitest.functional.config.ts`) forces IPv4 DNS because some sandboxes hang on IPv6-first egress; that setting is test-runner only and never ships. Keep live tests out of the default `pnpm test` suite.

## Architecture

An SDK wrapping the WakaTime REST API (`https://api.wakatime.com/api/v1`), layered so each concern lives in one place:

**Auth strategy → HTTP core → resource classes → `WakatimeClient` facade → `src/index.ts`**

- `src/config.ts` - `resolveConfig` validates exactly one credential (`apiKey` xor `accessToken`) and fills defaults. Throws `WakatimeConfigError` at construction on misuse.
- `src/http/auth.ts` - injects credentials per request: Basic base64 for API key (or `?api_key=` query), Bearer for OAuth.
- `src/http/httpClient.ts` - the one axios instance. A request interceptor applies auth; `request()` owns the retry loop. `maxRedirects: 0` so WakaTime's 302 throttle reaches the retry logic. Resources call `http.get/post/put/delete<T>()`.
- `src/http/errors.ts` - `WakatimeError` base + subclasses mapped by status. `mapErrorFromResponse` also **redacts the Authorization header and api_key from the axios error before it is attached as `cause`** - do not undo this; it prevents credential leaks in logs.
- `src/http/retry.ts` / `pagination.ts` - backoff helpers and the `paginate()` async generator.
- `src/resources/*.ts` - one class per API resource group, each extending `BaseResource` (which provides `userSegment(user)` → `/users/${user ?? "current"}`). Response types are co-located in the same file and re-exported from `src/index.ts`.
- `src/client.ts` - constructs the HTTP client once and exposes every resource as a property.
- `src/resources/oauth.ts` - standalone server-side OAuth helpers (`buildAuthorizeUrl`/`exchangeCode`/`refreshToken`/`revokeToken`). These hit `wakatime.com/oauth/*` (a different host than the API), so they use a bare axios call, not `HttpClient`.

### WakaTime API quirks that shape the code

- **Envelope varies by endpoint.** Most responses wrap the payload in `data`; commits use `commit`/`commits`; summaries/durations return the object with sibling metadata. Unwrapping is done per resource method, not globally.
- **202 is not an error.** Stats-not-ready comes back as 202; the SDK returns the payload (with `is_up_to_date`/`percent_calculated`) so callers can poll. Only 4xx/5xx map to errors.
- **Retries are idempotent-only.** `request()` retries GET/PUT/DELETE on 429/302/5xx but never POST, since retrying a create could duplicate heartbeats/durations/dumps.

### Adding a resource

Create `src/resources/<name>.ts` with a class extending `BaseResource`, build the path with `userSegment(...)`, convert camelCase options to snake_case query params via `toQueryParams` (`src/util/query.ts`), then wire it into `src/client.ts` and export its types from `src/index.ts`. Add a mocked unit test under `test/`.

## Conventions specific to this repo

- ESM-only with `moduleResolution: bundler`. Relative imports must carry the `.js` extension (`./foo.js`), and `verbatimModuleSyntax` requires `import type` for type-only imports.
- `exactOptionalPropertyTypes` is on: an optional field you ever assign `undefined` to must be typed `foo?: T | undefined`.
- `src/index.ts` is the intended package entry and is the only permitted barrel; everything else imports direct from source.
