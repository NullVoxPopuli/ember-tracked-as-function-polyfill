import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, rerender } from '@ember/test-helpers';
import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';

const increment = (c) => c.value++;

module('tracked() | rendering', function (hooks) {
  setupRenderingTest(hooks);

  test('module state renders and updates', async function (assert) {
    const count = tracked(0);
    const add = () => count.value++;

    await render(
      <template>
        <output>{{count.value}}</output>
        <button type="button" {{on "click" add}}>add</button>
      </template>,
    );

    assert.dom('output').hasText('0');

    await click('button');
    assert.dom('output').hasText('1');

    count.set(5);
    await rerender();
    assert.dom('output').hasText('5');
  });

  test('tracked can be used as a helper', async function (assert) {
    await render(
      <template>
        {{#let (tracked 2) as |count|}}
          <output>{{count.value}}</output>
          <button id="inc" type="button" {{on "click" (fn increment count)}}>add</button>
          <button id="set" type="button" {{on "click" (fn count.set 10)}}>set</button>
        {{/let}}
      </template>,
    );

    assert.dom('output').hasText('2');

    await click('#inc');
    assert.dom('output').hasText('3');

    await click('#set');
    assert.dom('output').hasText('10');
  });

  test('default equals does not re-render for equal values', async function (assert) {
    const count = tracked(0);
    const step = () => {
      assert.step(String(count.value));
      return count.value;
    };

    await render(<template>{{(step)}}</template>);
    assert.verifySteps(['0']);

    count.set(0);
    await rerender();
    assert.verifySteps([]);

    count.set(1);
    await rerender();
    assert.verifySteps(['1']);
  });

  test('equals: () => false re-renders on every set', async function (assert) {
    const count = tracked(0, { equals: () => false });
    const step = () => {
      assert.step(String(count.value));
      return count.value;
    };

    await render(<template>{{(step)}}</template>);
    assert.verifySteps(['0']);

    count.set(0);
    await rerender();
    assert.verifySteps(['0']);
  });

  test('private tracked state in a component', async function (assert) {
    class Counter extends Component {
      #count = tracked(0);

      get count() {
        return this.#count.value;
      }

      add = () => this.#count.update((n) => n + 1);

      <template>
        <output>{{this.count}}</output>
        <button type="button" {{on "click" this.add}}>add</button>
      </template>
    }

    await render(<template><Counter /></template>);
    assert.dom('output').hasText('0');

    await click('button');
    assert.dom('output').hasText('1');
  });

  test('@tracked({ equals }) does not re-render for equal values', async function (assert) {
    class State {
      @tracked({ equals: (a, b) => a === b }) value = 0;
    }

    const state = new State();
    const step = () => {
      assert.step(String(state.value));
      return state.value;
    };

    await render(<template>{{(step)}}</template>);
    assert.verifySteps(['0']);

    state.value = 0;
    await rerender();
    assert.verifySteps([]);

    state.value = 1;
    await rerender();
    assert.verifySteps(['1']);
  });
});
