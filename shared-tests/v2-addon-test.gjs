import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { createCounter, V2Counter } from 'v2-addon';

module('v2-addon | tracked()', function (hooks) {
  setupRenderingTest(hooks);

  test('tracked() inside the addon returns a TrackedValue', async function (assert) {
    let counter = createCounter(3);

    assert.strictEqual(counter.value, 3);
    assert.true(counter.set(4));

    counter.freeze();
    assert.throws(() => counter.set(5), /v2-addon counter/);
  });

  test('the addon component renders and updates', async function (assert) {
    await render(<template><V2Counter /></template>);

    assert.dom('[data-v2-label]').hasText('v2');
    assert.dom('[data-v2-count]').hasText('0');

    await click('[data-v2-add]');
    assert.dom('[data-v2-count]').hasText('1');
  });
});
