import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const shared = join(root, 'shared-tests');

const modern = ['tracked-test.js', 'rendering-test.gjs'];
const minimum = ['tracked-test.js', 'rendering-test-hbs.js'];

const targets = [
  {
    dir: 'ember-tracked-as-function-polyfill/tests/shared',
    files: modern,
    importFrom: '#src/index.ts',
  },
  { dir: 'test-apps/ember-cli-app/tests/shared', files: modern },
  {
    dir: 'test-apps/ember-cli-app-with-v1-addon/tests/shared',
    files: [...modern, 'v1-addon-test.js'],
  },
  { dir: 'test-apps/vite-app/tests/shared', files: modern },
  {
    dir: 'test-apps/vite-app-with-v1-addon/tests/shared',
    files: [...modern, 'v1-addon-test.js'],
  },
  {
    dir: 'test-apps/vite-app-with-v2-addon/tests/shared',
    files: [...modern, 'v2-addon-test.gjs'],
  },
  {
    dir: 'test-apps/minimum-supported/ember-cli-app/tests/shared',
    files: minimum,
  },
  {
    dir: 'test-apps/minimum-supported/ember-cli-app-with-v1-addon/tests/shared',
    files: [...minimum, 'v1-addon-test.js'],
  },
];

const only = process.argv[2];

for (const { dir, files, importFrom } of targets) {
  if (only && !dir.startsWith(only)) continue;

  const destination = join(root, dir);

  mkdirSync(destination, { recursive: true });

  for (const file of files) {
    let source = readFileSync(join(shared, file), 'utf8');

    if (importFrom) {
      source = source.replace(
        `import { tracked } from '@glimmer/tracking';`,
        `import { tracked } from '${importFrom}';`,
      );
    }

    writeFileSync(join(destination, file), source);
  }
}
