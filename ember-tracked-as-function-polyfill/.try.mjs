// When building your addon for older Ember versions you need to have the required files
const compatFiles = {
  'ember-cli-build.cjs': `const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const { compatBuild } = require('@embroider/compat');
module.exports = async function (defaults) {
  const { buildOnce } = await import('@embroider/vite');
  let app = new EmberApp(defaults);
  return compatBuild(app, buildOnce);
};`,
  'config/optional-features.json': JSON.stringify({
    'application-template-wrapper': false,
    'default-async-observers': true,
    'jquery-integration': false,
    'template-only-glimmer-components': true,
    'no-implicit-route-model': true,
  }),
};

const compatDeps = {
  '@embroider/compat': '^4.0.3',
  'ember-cli': '^5.12.0',
  'ember-auto-import': '^2.10.0',
  '@ember/optional-features': '^2.2.0',
};

function compatScenario(name, version) {
  return {
    name,
    npm: {
      devDependencies: {
        'ember-source': version,
        ...compatDeps,
      },
    },
    env: {
      ENABLE_COMPAT_BUILD: true,
    },
    files: compatFiles,
  };
}

function scenario(name, version) {
  return {
    name,
    npm: {
      devDependencies: {
        'ember-source': `npm:ember-source@${version}`,
      },
    },
  };
}

export default {
  scenarios: [
    compatScenario('ember-lts-4.12', '~4.12.0'),
    compatScenario('ember-lts-5.12', '~5.12.0'),
    scenario('ember-lts-6.12', '~6.12.0'),
    scenario('ember-latest', 'latest'),
    scenario('ember-beta', 'beta'),
    scenario('ember-alpha', 'alpha'),
  ],
};
