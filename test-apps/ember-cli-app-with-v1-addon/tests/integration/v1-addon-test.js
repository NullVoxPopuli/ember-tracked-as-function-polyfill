import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { createCounter } from 'v1-addon/counter';

module('v1-addon | tracked()', function (hooks) {
  setupRenderingTest(hooks);

  test('tracked() inside the addon returns a TrackedValue', async function (assert) {
    let counter = createCounter(3);

    assert.strictEqual(counter.value, 3);
    assert.true(counter.set(4));

    counter.freeze();
    assert.throws(() => counter.set(5), /v1-addon counter/);
  });

  test('the addon component renders and updates', async function (assert) {
    await render(hbs`<V1Counter />`);

    assert.dom('[data-v1-label]').hasText('v1');
    assert.dom('[data-v1-count]').hasText('0');

    await click('[data-v1-add]');
    await settled();
    assert.dom('[data-v1-count]').hasText('1');
  });
});
