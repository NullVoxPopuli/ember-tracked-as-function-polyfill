import { module, test } from 'qunit';
import {
  type Reactive,
  type ReadOnlyReactive,
  tracked,
  type TrackedValue,
} from '#src/index.ts';

module('tracked() | types', function () {
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
