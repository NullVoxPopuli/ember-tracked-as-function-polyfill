import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { on } from '@ember/modifier';
import {
  type Reactive,
  type ReadOnlyReactive,
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

  test('public types line up with RFC 1071', function (assert) {
    const count: TrackedValue<number> = tracked(0);
    const reactive: Reactive<number> = count;
    const readOnly: ReadOnlyReactive<number> = count;
    const changed: boolean = count.set(1);
    const value: number = count.get();

    count.update((n) => n + 1);

    const custom = tracked(
      { id: 1 },
      { equals: (a, b) => a.id === b.id, description: 'custom' },
    );
    const id: number = custom.value.id;

    class State {
      @tracked({ equals: (a: number, b: number) => a === b }) value = 0;
      @tracked plain = 'plain';
    }

    const state = new State();

    assert.strictEqual(reactive.value, 2);
    assert.strictEqual(readOnly.value, 2);
    assert.true(changed);
    assert.strictEqual(value, 1);
    assert.strictEqual(id, 1);
    assert.strictEqual(state.value, 0);
    assert.strictEqual(state.plain, 'plain');
  });
});
