import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { tracked } from '@glimmer/tracking';

module('tracked() | rendering (hbs)', function (hooks) {
  setupRenderingTest(hooks);

  test('renders and updates', async function (assert) {
    let count = tracked(0);

    this.count = count;
    this.add = () => count.value++;

    await render(hbs`
      <output>{{this.count.value}}</output>
      <button type="button" {{on "click" this.add}}>add</button>
    `);

    assert.dom('output').hasText('0');

    await click('button');
    assert.dom('output').hasText('1');

    count.set(5);
    await settled();
    assert.dom('output').hasText('5');
  });

  test('set can be partially applied', async function (assert) {
    this.count = tracked(1);

    await render(hbs`
      <output>{{this.count.value}}</output>
      <button type="button" {{on "click" (fn this.count.set 10)}}>set</button>
    `);

    await click('button');
    assert.dom('output').hasText('10');
  });

  test('@tracked({ equals }) does not re-render for equal values', async function (assert) {
    class State {
      @tracked({ equals: (a, b) => a === b }) value = 0;
    }

    let state = new State();

    this.state = state;

    await render(hbs`<output>{{this.state.value}}</output>`);
    assert.dom('output').hasText('0');

    state.value = 1;
    await settled();
    assert.dom('output').hasText('1');
  });
});
