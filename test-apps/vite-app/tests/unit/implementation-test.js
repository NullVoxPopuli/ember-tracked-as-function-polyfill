import { module, test } from 'qunit';
import * as glimmerTracking from '@glimmer/tracking';
import { tracked } from 'ember-tracked-as-function-polyfill';

function hasNativeTrackedValue() {
  try {
    return glimmerTracking.tracked(0).value === 0;
  } catch {
    return false;
  }
}

module('Unit | implementation selection', function () {
  if (hasNativeTrackedValue()) {
    test('re-exports the native tracked', function (assert) {
      assert.strictEqual(tracked, glimmerTracking.tracked);
    });
  } else {
    test('provides the polyfilled tracked', function (assert) {
      assert.notStrictEqual(tracked, glimmerTracking.tracked);
      assert.strictEqual(tracked(0).value, 0);
    });
  }
});
