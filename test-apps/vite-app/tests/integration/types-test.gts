import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { on } from '@ember/modifier';
import {
  tracked,
  type TrackedValue,
} from 'ember-tracked-as-function-polyfill';

module('tracked() | gts with polyfill types', function (hooks) {
  setupRenderingTest(hooks);

  test('TrackedValue types work against this ember-source', async function (assert) {
    const count: TrackedValue<number> = tracked(0);
    const add = () => count.update((n) => n + 1);

    class State {
      @tracked({ equals: (a: number, b: number) => a === b }) value = 0;
    }

    const state = new State();

    await render(
      <template>
        <output>{{count.value}}</output>
        <span>{{state.value}}</span>
        <button type="button" {{on "click" add}}>add</button>
      </template>,
    );

    await click('button');
    assert.dom('output').hasText('1');
    assert.dom('span').hasText('0');
  });
});
