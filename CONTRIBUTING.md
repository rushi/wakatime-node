# Contributing

## Setup

```bash
pnpm install
```

Requires Node.js 20+ (see `.node-version`) and pnpm 9+.

## Workflow

```bash
pnpm typecheck        # tsc --noEmit
pnpm lint             # eslint
pnpm format           # prettier --write
pnpm test             # offline unit suite (MSW-mocked)
pnpm build            # bundle to dist/
```

Run a single test file or name:

```bash
pnpm test test/resources/stats.test.ts
pnpm test -t "retries a 429"
```

All of the above must pass before opening a PR; CI runs the same checks.

## Adding a resource

See the "Adding a resource" section in `CLAUDE.md` for the pattern: one class per resource extending `BaseResource`, wired into `src/client.ts` and exported from `src/index.ts`, with a mocked unit test under `test/`.

## Functional tests

`pnpm test:functional` hits the real WakaTime API read-only and reads `WAKATIME_OAUTH_TOKEN` and `WAKATIME_API_KEY` (env var or repo-root `.env.local`, gitignored). Each suite runs once per credential set. It self-skips when both are absent and isn't run in CI.

## Pull requests

Keep PRs focused. Add or update tests for any behavior change. Don't commit `dist/` or `.env.local`.
