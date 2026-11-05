export default {
  scenarios: [
    {
      name: 'ember-lts-4.12',
      npm: { devDependencies: { 'ember-source': '~4.12.0' } },
    },
    {
      name: 'ember-lts-5.12',
      npm: { devDependencies: { 'ember-source': '~5.12.0' } },
    },
    {
      name: 'ember-latest',
      npm: { devDependencies: { 'ember-source': 'latest' } },
    },
    {
      name: 'ember-beta',
      npm: { devDependencies: { 'ember-source': 'beta' } },
    },
  ],
};
