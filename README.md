<div align="center">

# reqprobe

**TypeScript-first API testing for teams that ship.**

[![npm](https://img.shields.io/npm/v/reqprobe?color=0ea5e9&label=npm)](https://www.npmjs.com/package/reqprobe)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)](https://www.typescriptlang.org)

Write API tests in TypeScript. Run them from the CLI. Validate against your OpenAPI spec. Ship with confidence.

</div>

---

## What is reqprobe?

Traditional GUI-based tools like Postman or Insomnia are built for manual exploration. `reqprobe` is a **code-first API testing framework** built for automation. Tests live in your repo as `.ts` files — versioned, diff-able, and reviewable like any other code.

### Why not GUI-based tools?

| | GUI-based Tools | reqprobe |
|---|---|---|
| **Lives in Git** | ❌ JSON exports, not code | ✅ `.ts` files, full diff history |
| **TypeScript** | ❌ Proprietary scripting | ✅ Native, typed, IDE-complete |
| **CI/CD** | ⚠️ Requires external runners | ✅ `npx reqprobe run` — done |
| **OpenAPI validation** | ❌ Manual schema checks | ✅ Automatic per-request |
| **Code review** | ❌ Proprietary state, no diffs | ✅ PRs, blame, history |
| **Cost** | 💸 Subscriptions required | ✅ Free, open-source |

If your tests live in a GUI, they don't belong to your team — they belong to a vendor. **reqprobe puts your tests back in your codebase.**

---

## Features

| | Feature | Description |
|---|---------|-------------|
| 📝 | **TypeScript Native** | Tests are written in fully typed `.ts` files with full IDE support. |
| 🛡️ | **OpenAPI Contract Validation** | Automatically validate response payloads against your OpenAPI 3.x spec using Ajv — no extra assertion code needed. |
| 📊 | **Rich Reporting** | Self-contained HTML + JSON reports. No external dependencies. |
| 🌱 | **Git-Native** | Full diff history, PR reviews, blame — your tests are real code. |
| ⚙️ | **CI/CD Ready** | Exits with code `1` on failure. Works with GitHub Actions, GitLab CI, and any CI runner out of the box. |
| 🏗️ | **Monorepo Support** | Per-package config. Each service owns its own tests. |
| 🔜 | **Watch Mode** | *(Coming soon)* `reqprobe run --watch` — re-run tests on file save. |
| 🔜 | **Scaffold Generator** | *(Coming soon)* Generate typed test stubs from your OpenAPI spec. |
| 🔜 | **beforeAll / afterAll hooks** | *(Coming in v0.2)* Shared setup and teardown across tests. |

---

## Quick Start

> **reqprobe is not yet published to npm.** Install it directly from GitHub — see the full guide in **[INSTALL_FROM_GITHUB.md](./INSTALL_FROM_GITHUB.md)**.

### 1. Install into your project

```bash
npm install github:shashi089/reqprobe
```

### 2. Create a config file

```ts
// reqprobe.config.ts
import type { Config } from 'reqprobe';

const config: Config = {
  baseUrl: 'https://your-api.com',
  timeout: 10_000,
  headers: {
    Authorization: `Bearer ${process.env.API_TOKEN}`,
  },
};

export default config;
```

### 3. Write a test

```ts
// tests/users.test.ts
import { test } from 'reqprobe/dsl';

test('GET /users — returns 200', async (ctx) => {
  const res = await ctx.request({ url: '/users', method: 'GET' });
  ctx.expect(res).toHaveStatus(200);
  ctx.expect(res.body).toHaveProperty('data');
});
```

### 4. Run it

```bash
npx reqprobe run "tests/**/*.test.ts"
```

Output:

```
❯ users.test.ts

  ✓ GET /users — returns 200   312ms

────────────────────────────────────────
   PASSED   312ms
────────────────────────────────────────
  ✓ Passed  1
  ✖ Failed  0
    Total   1
────────────────────────────────────────
```

Exit code `1` on failure — CI-ready out of the box.

---

## Try It Against a Real API

Want to see reqprobe working immediately? Run this against the free [PokéAPI](https://pokeapi.co) — no auth required.

```ts
// tests/pokeapi.test.ts
import { test } from 'reqprobe/dsl';

test('GET /pokemon/pikachu — returns correct name', async (ctx) => {
  const res = await ctx.request({ url: '/pokemon/pikachu', method: 'GET' });
  ctx.expect(res).toHaveStatus(200);
  ctx.expect(res.body.name).toBe('pikachu');
});

test('GET /pokemon/1 — returns bulbasaur', async (ctx) => {
  const res = await ctx.request({ url: '/pokemon/1', method: 'GET' });
  ctx.expect(res).toHaveStatus(200);
  ctx.expect(res.body.name).toBeTruthy();
});
```

```ts
// reqprobe.config.ts
const config = {
  baseUrl: 'https://pokeapi.co/api/v2',
  timeout: 10_000,
};
export default config;
```

```bash
npx reqprobe run "tests/pokeapi.test.ts"
```

---

## Configuration

```ts
// reqprobe.config.ts
import type { Config } from 'reqprobe';

const config: Config = {
  baseUrl: 'https://api.yourservice.com',
  timeout: 10_000,
  headers: {
    Authorization: `Bearer ${process.env.API_TOKEN}`,
  },
  openapi: {
    specPath: './openapi.json',
    strict: false,           // true = fail on missing schemas
  },
  reporters: {
    outDir: './reqprobe-reports',
    json: true,
    html: true,
  },
};

export default config;
```

---

## Writing Tests

### DSL style (recommended)

```ts
// users.test.ts
import { test } from 'reqprobe/dsl';

test('GET /users — returns a list', async (ctx) => {
  const res = await ctx.request({ url: '/users', method: 'GET' });
  ctx.expect(res).toHaveStatus(200);
  ctx.expect(res.body).toHaveProperty('data');
});

test('POST /users — creates a user', async (ctx) => {
  const res = await ctx.request({
    url: '/users',
    method: 'POST',
    body: { name: 'Alice', email: 'alice@example.com' },
  });
  ctx.expect(res).toHaveStatus(201);
  ctx.expect(res.body.name).toBe('Alice');
});
```

### Suite style (for shared setup)

```ts
// auth.test.ts
import type { TestSuite } from 'reqprobe';

const suite: TestSuite = {
  name: 'Auth API',
  tests: [
    {
      name: 'POST /auth/login — returns token',
      run: async (ctx) => {
        const res = await ctx.request({
          url: '/auth/login',
          method: 'POST',
          body: { email: 'admin@example.com', password: 'secret' },
        });
        ctx.expect(res).toHaveStatus(200);
        ctx.expect(res.body.token).toBeTruthy();
      },
    },
  ],
};

export default suite;
```

### Available assertions

```ts
ctx.expect(res).toHaveStatus(200);
ctx.expect(res.body.name).toBe('Alice');
ctx.expect(res.body.items).toEqual([1, 2, 3]);
ctx.expect(res.body.message).toContain('success');
ctx.expect(res.body.token).toBeTruthy();
ctx.expect(res.body).toHaveProperty('id');
```

---

## OpenAPI Contract Validation

> **This feature is entirely optional.** reqprobe works perfectly without a spec — OpenAPI validation is an additive layer you enable when you're ready.

Point reqprobe at your OpenAPI 3.x spec and every response is automatically validated against its schema using [Ajv](https://ajv.js.org/) — no extra assertions needed in your tests.

```ts
// reqprobe.config.ts
const config: Config = {
  baseUrl: 'https://api.yourservice.com',
  openapi: {
    specPath: './openapi.json',
    strict: false,
  },
};
```

```ts
// products.test.ts
test('GET /products/:id — response matches schema', async (ctx) => {
  const res = await ctx.request({ url: '/products/42', method: 'GET' });

  // reqprobe automatically validates res.body against
  // the GET /products/{id} → 200 schema in your spec.
  // No extra assertion needed.
  ctx.expect(res).toHaveStatus(200);
});
```

If the response body doesn't match the schema, reqprobe throws a detailed error:

```
  ✖ GET /products/42 — response matches schema  (67ms)
    ├ [reqprobe/openapi] Response body failed schema validation:
    ├   • body.price: must be number
    └   • body.stock: must have required property 'stock'
```

**Supported:**
- OpenAPI 3.x JSON specs
- Local `$ref` resolution
- Path template matching (`/users/{id}`)
- `default` response fallback
- `strict: false` silently skips missing schemas (good for partial specs)

---

## Generating Reports

> **This feature is entirely optional.** If no `reporters` config is set, reqprobe simply prints results to the terminal and exits — no files are written.

```ts
reporters: {
  outDir: './reqprobe-reports',
  json: true,   // reqprobe-reports/report.json
  html: true,   // reqprobe-reports/report.html
}
```

The **HTML report** is a fully self-contained, dependency-free file — open it in any browser, attach it to a PR, or upload it as a CI artifact. It includes:
- Pass/fail summary with total duration
- Per-suite test tables with badges
- Expandable error rows showing expected vs received + response body

The **JSON report** is machine-readable — suitable for dashboards, downstream tooling, or Slack bots.

---

## CI Integration

### GitHub Actions

```yaml
# .github/workflows/api-tests.yml
name: API Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - name: Run API tests
        run: npx reqprobe run "tests/**/*.test.ts"
        env:
          API_TOKEN: ${{ secrets.API_TOKEN }}
          BASE_URL: ${{ vars.STAGING_URL }}
      - name: Upload HTML report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: reqprobe-report
          path: reqprobe-reports/
```

### GitLab CI

```yaml
api-tests:
  image: node:20-alpine
  script:
    - npm ci
    - npx reqprobe run "tests/**/*.test.ts"
  artifacts:
    when: always
    paths:
      - reqprobe-reports/
    expire_in: 7 days
  variables:
    API_TOKEN: $API_TOKEN
```

reqprobe exits with code `1` when any test fails — no extra configuration needed.

---

## Monorepo Usage

reqprobe reads config from the nearest `reqprobe.config.ts` relative to where you run it. Each package can have its own config:

```
apps/
  users-service/
    reqprobe.config.ts      # baseUrl: http://users-service
    tests/
      users.test.ts
  orders-service/
    reqprobe.config.ts      # baseUrl: http://orders-service
    tests/
      orders.test.ts
```

```bash
# Run tests for a specific service from monorepo root
npx reqprobe run "apps/users-service/tests/**/*.test.ts"

# Or from within the package
cd apps/users-service
npx reqprobe run "tests/**/*.test.ts"
```

Shared base config with per-service overrides:

```ts
// apps/users-service/reqprobe.config.ts
import baseConfig from '../../reqprobe.base.config.ts';

export default {
  ...baseConfig,
  baseUrl: process.env.USERS_SERVICE_URL ?? 'http://localhost:3001',
};
```

---

## Project Structure

```
src/
├── types/        shared TypeScript contracts
├── config/       config file loader
├── request/      HTTP client (fetch-based, Node 18+)
├── assertions/   assertion library (toBe, toHaveStatus, …)
├── dsl/          global test() + expect() DSL
├── runner/       test orchestrator
├── openapi/      spec loading, $ref resolution, Ajv validation
├── reporters/    JSON + HTML report generation
├── cli/          CLI commands (run, init)
└── utils/        logger
```

**Dependency rules:** each module only imports from modules below it. No circular dependencies. No DI framework.

---

## Roadmap

| Status | Feature |
|---|---|
| ✅ | TypeScript-first test runner |
| ✅ | DSL (`test()`) + suite (`TestSuite`) patterns |
| ✅ | Full assertion library |
| ✅ | OpenAPI 3.x response validation |
| ✅ | HTML + JSON reports |
| ✅ | CI exit codes |
| ✅ | `.env` support |
| 🔜 | `beforeAll` / `afterAll` hooks (v0.2) |
| 🔜 | Watch mode (`reqprobe run --watch`) |
| 🔜 | Scaffold from OpenAPI spec |
| 🔜 | Parallel test execution |
| 🔜 | Response time assertions (`toRespondWithin`) |
| 🔜 | JUnit XML report (Jenkins / Azure DevOps) |
| 🔜 | gRPC support |
| 🔜 | VS Code extension |

---

## Contributing

Contributions are welcome. reqprobe is intentionally small — please keep PRs focused.

### Setup

```bash
git clone https://github.com/shashi089/reqprobe.git
cd reqprobe
npm install
npm run build
```

### Project conventions

- **No new runtime dependencies** without discussion — current footprint is intentionally minimal (`ajv`, `commander`, `dotenv`, `fast-glob`, `picocolors`, `tsx`)
- **Single responsibility** — each module in `src/` has one job
- **No circular imports** — dependency graph is strictly one-way
- **TypeScript strict mode** — `tsc` must exit 0 before any PR is merged

### Submitting a PR

1. Fork the repo and create a feature branch
2. Make your change + update or add examples in `examples/`
3. Run `npm run build` — must exit 0
4. Open a PR with a clear description of what and why

### Reporting bugs

Open an issue with:
- reqprobe version (`npx reqprobe --version`)
- Node version (`node --version`)
- Minimal reproduction (test file + config)
- Actual vs expected output

---

## License

MIT © Shashidhar Naik