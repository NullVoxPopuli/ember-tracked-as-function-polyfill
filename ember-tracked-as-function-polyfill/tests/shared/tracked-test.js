import { module, test } from 'qunit';
import { tracked } from '#src/index.ts';
import EmberObject, { defineProperty, set } from '@ember/object';
import { track, validateTag, valueForTag } from '@glimmer/validator';

function isValidAfter(read, write) {
  let tag = track(read);
  let snapshot = valueForTag(tag);

  write();

  return validateTag(tag, snapshot);
}

module('tracked() | standalone', function () {
  test('creates a reactive value', function (assert) {
    let count = tracked(0);

    assert.strictEqual(count.value, 0);
    assert.strictEqual(count.get(), 0);

    count.value = 1;
    assert.strictEqual(count.value, 1);

    count.set(2);
    assert.strictEqual(count.value, 2);

    count.update((value) => value + 1);
    assert.strictEqual(count.value, 3);
  });

  test('set() reports whether the value changed', function (assert) {
    let x = tracked('hello');

    assert.true(x.set('world'));
    assert.strictEqual(x.value, 'world');
    assert.false(x.set('world'));
  });

  test('reading consumes and writing dirties', function (assert) {
    let count = tracked(0);

    assert.false(
      isValidAfter(
        () => count.value,
        () => (count.value = 1),
      ),
    );
  });

  test('default equality is Object.is', function (assert) {
    let count = tracked(0);

    assert.true(
      isValidAfter(
        () => count.value,
        () => (count.value = 0),
      ),
    );
    assert.false(
      isValidAfter(
        () => count.value,
        () => (count.value = 1),
      ),
    );
  });

  test('equality can be customized', function (assert) {
    let state = tracked({ id: 1 }, { equals: (a, b) => a.id === b.id });

    assert.true(
      isValidAfter(
        () => state.value,
        () => (state.value = { id: 1 }),
      ),
    );
    assert.false(
      isValidAfter(
        () => state.value,
        () => (state.value = { id: 2 }),
      ),
    );
  });

  test('always-dirty equality', function (assert) {
    let count = tracked(0, { equals: () => false });

    assert.false(
      isValidAfter(
        () => count.value,
        () => (count.value = 0),
      ),
    );
  });

  test('update() reads without consuming', function (assert) {
    let count = tracked(0);

    assert.true(
      isValidAfter(
        () => count.update((value) => value),
        () => (count.value = 1),
      ),
    );
  });

  test('freeze() prevents further updates', function (assert) {
    let count = tracked(0);

    count.freeze();

    assert.throws(() => count.set(1), /frozen/);
    assert.throws(() => (count.value = 1), /frozen/);
    assert.strictEqual(count.value, 0);
  });

  test('frozen errors include the description', function (assert) {
    let count = tracked(0, { description: 'my-count' });

    count.freeze();

    assert.throws(() => count.set(1), /my-count/);
  });

  test('methods are stable and can be detached', function (assert) {
    let count = tracked(0);

    assert.strictEqual(count.get, count.get);
    assert.strictEqual(count.set, count.set);
    assert.strictEqual(count.update, count.update);
    assert.strictEqual(count.freeze, count.freeze);

    let { get, set: setValue, update, freeze } = count;

    setValue(1);
    assert.strictEqual(get(), 1);

    update((value) => value + 1);
    assert.strictEqual(get(), 2);

    freeze();
    assert.throws(() => setValue(3), /frozen/);
  });

  test('works with null and undefined initial values', function (assert) {
    let a = tracked(null);
    let b = tracked(undefined);

    assert.strictEqual(a.value, null);
    assert.strictEqual(b.value, undefined);

    a.value = 1;
    b.value = 2;

    assert.strictEqual(a.value, 1);
    assert.strictEqual(b.value, 2);
  });

  test('wraps arbitrary objects', function (assert) {
    let initial = { foo: 1 };

    assert.strictEqual(tracked(initial).value, initial);
  });

  test('wraps option-shaped objects when given a second argument', function (assert) {
    let initial = { value: 5 };
    let state = tracked(initial, {});

    assert.strictEqual(state.value, initial);
  });

  test('rejects a non-object second argument', function (assert) {
    assert.throws(() => tracked(0, 'nope'), /options object/);
  });
});

module('tracked() | decorator', function () {
  test('@tracked without options dirties on self-assignment', function (assert) {
    class State {
      @tracked value = 0;
    }

    let obj = new State();

    assert.false(
      isValidAfter(
        () => obj.value,
        () => (obj.value = obj.value),
      ),
    );
  });

  test('@tracked({ equals }) does not dirty for equal values', function (assert) {
    class State {
      @tracked({ equals: (a, b) => a === b }) value = 0;
    }

    let obj = new State();

    assert.strictEqual(obj.value, 0);
    assert.true(
      isValidAfter(
        () => obj.value,
        () => (obj.value = 0),
      ),
    );
    assert.false(
      isValidAfter(
        () => obj.value,
        () => (obj.value = 1),
      ),
    );
    assert.strictEqual(obj.value, 1);
  });

  test('@tracked({ equals }) compares against the initial value', function (assert) {
    let compared = [];

    class State {
      @tracked({
        equals: (a, b) => {
          compared.push([a, b]);
          return a === b;
        },
      })
      value = 0;
    }

    let obj = new State();

    obj.value = 1;

    assert.deepEqual(compared, [[0, 1]]);
    assert.strictEqual(obj.value, 1);
  });

  test('@tracked({ equals }) is respected by set()', function (assert) {
    class State {
      @tracked({ equals: (a, b) => a === b }) value = 0;
    }

    let obj = new State();

    assert.true(
      isValidAfter(
        () => obj.value,
        () => set(obj, 'value', 0),
      ),
    );
    assert.false(
      isValidAfter(
        () => obj.value,
        () => set(obj, 'value', 1),
      ),
    );
  });

  test('@tracked({ description }) is accepted', function (assert) {
    class State {
      @tracked({ description: 'count' }) value = 0;
    }

    let obj = new State();

    obj.value = 1;
    assert.strictEqual(obj.value, 1);
  });

  test('errors when equals is not a function', function (assert) {
    assert.throws(
      () => tracked({ equals: true }),
      /The 'equals' option passed to tracked must be a function/,
    );
  });

  test('errors when description is not a string', function (assert) {
    assert.throws(
      () => tracked({ description: 123 }),
      /The 'description' option passed to tracked must be a string/,
    );
  });

  test('errors when a default value is passed to a native decorator', function (assert) {
    assert.throws(() => {
      class State {
        @tracked({ value: 'default', equals: (a, b) => a === b }) value;
      }

      new State();
    }, /You can only use this syntax with classic classes/);
  });
});

module('tracked() | classic', function () {
  test('tracked() works in EmberObject.extend', function (assert) {
    let State = EmberObject.extend({
      first: tracked(),
      last: tracked({ value: 'Dale' }),
    });

    let obj = State.create({ first: 'Tom' });

    assert.strictEqual(obj.first, 'Tom');
    assert.strictEqual(obj.last, 'Dale');
  });

  test('equals works alongside a default value with defineProperty', function (assert) {
    class State {}

    defineProperty(
      State.prototype,
      'first',
      tracked({ value: 'Tom', equals: (a, b) => a === b }),
    );

    let obj = new State();

    assert.strictEqual(obj.first, 'Tom');
    assert.true(
      isValidAfter(
        () => obj.first,
        () => (obj.first = 'Tom'),
      ),
    );
    assert.false(
      isValidAfter(
        () => obj.first,
        () => (obj.first = 'Thomas'),
      ),
    );
  });

  test('equals works in EmberObject.extend with set()', function (assert) {
    let State = EmberObject.extend({
      first: tracked({ value: 'Tom', equals: (a, b) => a === b }),
    });

    let obj = State.create();

    assert.strictEqual(obj.first, 'Tom');
    assert.true(
      isValidAfter(
        () => obj.first,
        () => set(obj, 'first', 'Tom'),
      ),
    );
    assert.false(
      isValidAfter(
        () => obj.first,
        () => set(obj, 'first', 'Thomas'),
      ),
    );
    assert.strictEqual(obj.first, 'Thomas');
  });
});
