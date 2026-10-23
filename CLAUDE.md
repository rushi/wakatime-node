# CLAUDE.md

TypeScript SDK for the WakaTime REST API (`https://api.wakatime.com/api/v1`). Scripts live in `package.json`; run them with `pnpm`.

## Tests

`pnpm test` is the offline unit suite, MSW-mocked. Target one file or name with `pnpm test test/resources/stats.test.ts` or `pnpm test -t "retries a 429"`.

`pnpm test:functional` hits the real API, read-only. It reads `WAKATIME_OAUTH_TOKEN` and `WAKATIME_API_KEY` from the environment or a repo-root `.env.local`, runs each suite once per credential present (`test/functional/credentials.ts`), and self-skips when both are absent. Its config forces IPv4 DNS because some sandboxes hang on IPv6-first egress; that setting stays in the test runner and never ships. Live tests belong only in `test/functional/`, outside the default suite.

## Architecture

Layers: auth strategy, HTTP core, resource classes, `WakatimeClient` facade (`src/client.ts`), `src/index.ts`.

- `src/config.ts`: `resolveConfig` requires exactly one of `apiKey` or `accessToken` and throws `WakatimeConfigError` at construction otherwise.
- `src/http/httpClient.ts`: the one axios instance. `request()` owns the retry loop. `maxRedirects: 0` so WakaTime's 302 throttle reaches the retry logic.
- `src/http/errors.ts`: `mapErrorFromResponse` redacts the Authorization header and `api_key` from the axios error before attaching it as `cause`. Keep the redaction intact; it prevents credential leaks in logs.
- `src/resources/oauth.ts`: OAuth helpers target `wakatime.com/oauth/*`, a different host, so they use bare axios instead of `HttpClient`.

### WakaTime API quirks

- **Envelope varies by endpoint.** Most responses wrap the payload in `data`; commits use `commit`/`commits`; summaries and durations return the object with sibling metadata. Each resource method unwraps its own response.
- **202 is a success.** Stats-not-ready returns 202 with `is_up_to_date`/`percent_calculated`, and the SDK returns that payload so callers can poll. Only 4xx/5xx map to errors.
- **Retries are idempotent-only.** GET/PUT/DELETE retry on 429/302/5xx. POST runs once, since a retried create could duplicate heartbeats, durations, or dumps.

### Adding a resource

1. Create `src/resources/<name>.ts` with a class extending `BaseResource`. Build paths with `userSegment(user)` and convert camelCase options to snake_case query params with `toQueryParams` (`src/util/query.ts`). Co-locate response types in the same file.
2. Wire the class into `src/client.ts` and export its types from `src/index.ts`.
3. Add a mocked unit test under `test/resources/`.

## Conventions

- ESM-only, `moduleResolution: bundler`. Relative imports carry the `.js` extension (`./foo.js`). `verbatimModuleSyntax` requires `import type` for type-only imports.
- `exactOptionalPropertyTypes` is on: an optional field ever assigned `undefined` is typed `foo?: T | undefined`.
- `src/index.ts` is the only barrel; everything else imports direct from source.
