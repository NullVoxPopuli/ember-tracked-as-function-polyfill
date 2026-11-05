# How To Contribute

## Installation

- `git clone <repository-url>`
- `cd ember-tracked-as-function-polyfill`
- `pnpm install`

## Linting

- `pnpm lint`
- `pnpm lint:fix`

## Building the addon

- `pnpm build`

## Repository layout

| path                                                      | what                                                     |
| --------------------------------------------------------- | -------------------------------------------------------- |
| `ember-tracked-as-function-polyfill/`                     | the v2 addon and its babel plugin (`babel-plugin.cjs`)   |
| `test-packages/v1-addon`                                  | a v1 addon that uses `tracked()`                         |
| `test-packages/v2-addon`                                  | a v2 addon that uses `tracked()`                         |
| `test-apps/ember-cli-app`                                 | classic ember-cli app                                    |
| `test-apps/ember-cli-app-with-v1-addon`                   | classic ember-cli app with the v1 addon                  |
| `test-apps/vite-app`                                      | Vite app (TypeScript)                                    |
| `test-apps/vite-app-with-v1-addon`                        | Vite app with the v1 addon (through `@embroider/compat`) |
| `test-apps/vite-app-with-v2-addon`                        | Vite app with the v2 addon                               |
| `test-apps/minimum-supported/ember-cli-app`               | ember-source 3.28 classic app                            |
| `test-apps/minimum-supported/ember-cli-app-with-v1-addon` | ember-source 3.28 classic app with the v1 addon          |

## Running tests

- In this directory, `pnpm test` runs the babel plugin tests in node.
- From the repository root, `pnpm test` builds the addon and runs the babel plugin tests and the Ember tests in every test app.

The test apps use ember-source 6.12, so they run the polyfill. The `minimum-supported/` apps use ember-source 3.28. Each of the other apps has a `.try.mjs` with scenarios for ember-source 4.12, 5.12, latest and beta. On latest and beta, the polyfill re-exports the native `tracked`. To run a scenario:

```bash
cd test-apps/vite-app
pnpm dlx @embroider/try apply ember-latest
cd ../..
pnpm install --no-frozen-lockfile
pnpm build
pnpm --filter vite-app test
```

pnpm injects the workspace packages (`injectWorkspacePackages: true`). This makes peer dependencies such as `ember-source` resolve to each app's own copy. The root `build` script syncs the injected copies after a build.
