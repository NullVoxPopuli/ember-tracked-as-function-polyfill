import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class V1Counter extends Component {
  _count = tracked(0);

  @tracked({ equals: (a, b) => a === b }) label = 'v1';

  get count() {
    return this._count.value;
  }

  @action
  add() {
    this._count.update((n) => n + 1);
  }
}
