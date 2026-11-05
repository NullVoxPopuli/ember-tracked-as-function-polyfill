'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const babel = require('@babel/core');

const plugin = require('../babel-plugin.cjs');

function transform(code, { typescript = false } = {}) {
  let plugins = [plugin];

  if (typescript) {
    plugins.push([
      '@babel/plugin-transform-typescript',
      { onlyRemoveTypeImports: true },
    ]);
  }

  return babel
    .transformSync(code, {
      babelrc: false,
      configFile: false,
      filename: typescript ? 'file.ts' : 'file.js',
      plugins,
    })
    .code.trim();
}

test('rewrites a lone tracked import', () => {
  assert.equal(
    transform(`import { tracked } from '@glimmer/tracking';`),
    `import { tracked } from "ember-tracked-as-function-polyfill";`,
  );
});

test('keeps aliased local names', () => {
  assert.equal(
    transform(`import { tracked as t } from '@glimmer/tracking';\nt(0);`),
    `import { tracked as t } from "ember-tracked-as-function-polyfill";\nt(0);`,
  );
});

test('splits tracked away from cached', () => {
  assert.equal(
    transform(
      `import { cached, tracked } from '@glimmer/tracking';\ntracked(0);\ncached;`,
    ),
    [
      `import { tracked } from "ember-tracked-as-function-polyfill";`,
      `import { cached } from "@glimmer/tracking";`,
      `tracked(0);`,
      `cached;`,
    ].join('\n'),
  );
});

test('leaves imports without tracked alone', () => {
  let code = `import { cached } from '@glimmer/tracking';`;

  assert.equal(transform(code), code);
});

test('leaves namespace imports alone', () => {
  let code = `import * as tracking from '@glimmer/tracking';`;

  assert.equal(transform(code), code);
});

test('leaves other modules alone', () => {
  let code = `import { tracked } from 'tracked-built-ins';`;

  assert.equal(transform(code), code);
});

test('rewrites re-exports', () => {
  assert.equal(
    transform(`export { tracked, cached } from '@glimmer/tracking';`),
    [
      `export { tracked } from "ember-tracked-as-function-polyfill";`,
      `export { cached } from "@glimmer/tracking";`,
    ].join('\n'),
  );
});

test('rewrites type imports for TrackedValue', () => {
  assert.equal(
    transform(
      [
        `import { tracked, type TrackedValue } from '@glimmer/tracking';`,
        `export const count: TrackedValue<number> = tracked(0);`,
      ].join('\n'),
      { typescript: true },
    ),
    [
      `import { tracked } from "ember-tracked-as-function-polyfill";`,
      `export const count = tracked(0);`,
    ].join('\n'),
  );
});

test('keeps the binding usable by later plugins', () => {
  let seen;

  let inspector = () => ({
    visitor: {
      CallExpression(path) {
        let binding = path.scope.getBinding(path.node.callee.name);
        seen = binding && binding.path.parentPath.node.source.value;
      },
    },
  });

  babel.transformSync(
    `import { cached, tracked } from '@glimmer/tracking';\ntracked(0);`,
    {
      babelrc: false,
      configFile: false,
      filename: 'file.js',
      plugins: [plugin, inspector],
    },
  );

  assert.equal(seen, 'ember-tracked-as-function-polyfill');
});
