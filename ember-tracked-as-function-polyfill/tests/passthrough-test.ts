import { module, test } from 'qunit';
import { tracked as fromGlimmer } from '@glimmer/tracking';
import { tracked } from '#src/index.ts';

function hasNativeTrackedValue(): boolean {
  try {
    const value = (fromGlimmer as unknown as (v: number) => { value: number })(
      0,
    );

    return value.value === 0;
  } catch {
    return false;
  }
}

module('tracked() | passthrough', function () {
  test('re-exports the native tracked only when Ember has it', function (assert) {
    assert.strictEqual(
      (tracked as unknown) === (fromGlimmer as unknown),
      hasNativeTrackedValue(),
    );
  });
});
