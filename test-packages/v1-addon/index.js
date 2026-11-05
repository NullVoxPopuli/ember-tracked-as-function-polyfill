'use strict';

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
