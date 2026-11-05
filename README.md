# ember-tracked-as-function-polyfill

Use the [RFC 1071](https://rfcs.emberjs.com/id/1071-overload-tracked-for-non-class-use) `tracked` API on ember-source 3.28 and newer:

- `tracked(value, options?)` returns a `TrackedValue`.
- `@tracked({ equals, description })` lets a decorated field skip dirtying when the new value is equal.

ember-source 7.3 ships this API natively. On 7.3 and newer, this package re-exports the native `tracked`, so you can keep it installed while you upgrade.

## Install

```bash
pnpm add ember-tracked-as-function-polyfill
```

Then add the babel plugin to every project that imports `tracked` from `@glimmer/tracking`. That includes your app and each addon that uses the new API. The plugin changes:

```js
import { tracked } from '@glimmer/tracking';
```

to:

```js
import { tracked } from 'ember-tracked-as-function-polyfill';
```

The plugin moves only `tracked` and the `Reactive`, `ReadOnlyReactive` and `TrackedValue` types. Other imports, like `cached`, stay on `@glimmer/tracking`.

### Vite apps

In `babel.config.mjs` (or `.cjs`), add the plugin to the start of `plugins`:

```js
export default {
  plugins: [
    'ember-tracked-as-function-polyfill/babel-plugin',
    // ...the rest of your plugins
  ],
};
```

### Classic (ember-cli) apps

In `ember-cli-build.js`:

```js
const app = new EmberApp(defaults, {
  babel: {
    plugins: [
      require.resolve('ember-tracked-as-function-polyfill/babel-plugin'),
    ],
  },
});
```

### v1 addons

In the addon's `index.js`. The polyfill must be in the addon's `dependencies`, together with `ember-auto-import` v2. List `ember-source` in `peerDependencies`, so that the polyfill uses the app's copy of Ember:

```js
module.exports = {
  name: require('./package').name,

  options: {
    babel: {
      plugins: [
        require.resolve('ember-tracked-as-function-polyfill/babel-plugin'),
      ],
    },
  },
};
```

### v2 addons

In `babel.publish.config.cjs`, and in `babel.config.cjs` if you have one. The polyfill must be in the addon's `dependencies`. List `ember-source` in `peerDependencies`, so that the polyfill uses the app's copy of Ember:

```js
module.exports = {
  plugins: [
    'ember-tracked-as-function-polyfill/babel-plugin',
    // ...the rest of your plugins
  ],
};
```

The published `dist/` then imports from `ember-tracked-as-function-polyfill`. The app's babel config does not touch it.

## Usage

```gjs
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

const count = tracked(0);
const increment = () => count.value++;

<template>
  Count is: {{count.value}}

  <button {{on "click" increment}}>add one</button>
</template>
```

`TrackedValue` has:

| member       | does                                                                 |
| ------------ | -------------------------------------------------------------------- |
| `value`      | a read consumes the value, and a write dirties it                    |
| `get()`      | reads the value                                                      |
| `set(v)`     | writes the value. Returns `true` if it changed, `false` if equal     |
| `update(fn)` | writes `fn(current)` and does not consume the current value          |
| `freeze()`   | makes all later writes throw                                         |

`get`, `set`, `update` and `freeze` are bound, so `{{on "click" (fn count.set 2)}}` works.

The default `equals` is `Object.is`. Use `{ equals: () => false }` to dirty on every write:

```js
const state = tracked({ id: 1 }, { equals: (a, b) => a.id === b.id });
```

Decorators accept the same options:

```js
class Demo {
  @tracked({ equals: (a, b) => a === b }) value = 0;
}
```

`tracked` can also be a template helper, for example `{{#let (tracked 1) as |count|}}`. Plain functions as helpers need ember-source 4.5 or newer.

## TypeScript

On ember-source older than 7.3, the types of `@glimmer/tracking` do not have the new overloads. Import `tracked` and the types from the polyfill:

```ts
import { tracked, type TrackedValue } from 'ember-tracked-as-function-polyfill';

const count: TrackedValue<number> = tracked(0);
```

## Known limitations on ember-source older than 7.3

- With `@tracked({ equals })`, Ember's `set(obj, key, value)` can still dirty when `value` is a different object that `equals` reports as equal. This is because `set()` dirties on `!==`. Normal assignment (`obj.key = value`) respects `equals`.
- `description` on a decorator is accepted, but nothing uses it.
- Namespace imports (`import * as tracking from '@glimmer/tracking'`) are not changed.
- `@tracked` as a standard (stage 3) decorator is not added. Older Ember does not support it either.

## Compatibility

- ember-source 3.28 or newer
- Vite apps, classic ember-cli apps, v1 addons and v2 addons

## License

MIT
