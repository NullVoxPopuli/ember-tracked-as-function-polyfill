# ember-tracked-as-function-polyfill (monorepo)

The package is in [`ember-tracked-as-function-polyfill/`](./ember-tracked-as-function-polyfill). Its README has the install steps and the API.

## Layout

| path | what |
| --- | --- |
| `ember-tracked-as-function-polyfill/` | the v2 addon and its babel plugin (`babel-plugin.cjs`) |
| `shared-tests/` | the test files that every test app runs |
| `test-packages/v1-addon` | a v1 addon that uses `tracked()` |
| `test-packages/v2-addon` | a v2 addon that uses `tracked()` |
| `test-apps/ember-cli-app` | classic ember-cli app |
| `test-apps/ember-cli-app-with-v1-addon` | classic ember-cli app with the v1 addon |
| `test-apps/vite-app` | Vite app (TypeScript) |
| `test-apps/vite-app-with-v1-addon` | Vite app with the v1 addon (through `@embroider/compat`) |
| `test-apps/vite-app-with-v2-addon` | Vite app with the v2 addon |
| `test-apps/minimum-supported/ember-cli-app` | ember-source 3.28 classic app |
| `test-apps/minimum-supported/ember-cli-app-with-v1-addon` | ember-source 3.28 classic app with the v1 addon |

The test apps use ember-source 6.12 (3.28 for `minimum-supported/`), so they run the polyfill. The addon's own tests use the latest ember-source, so they run the native `tracked`. Both use the same tests.

## Tests

```bash
pnpm install
pnpm test
```

`shared-tests/` is the source of truth. After you change a file there, run `pnpm sync-tests` to copy it into each app's `tests/shared/`.

pnpm injects the workspace packages (`injectWorkspacePackages: true`). This makes peer dependencies such as `ember-source` resolve to each app's own copy. The root `build` script syncs the injected copies after a build.
