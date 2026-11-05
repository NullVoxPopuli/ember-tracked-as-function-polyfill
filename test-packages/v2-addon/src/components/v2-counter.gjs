import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

export default class V2Counter extends Component {
  #count = tracked(0);

  @tracked({ equals: (a, b) => a === b }) label = 'v2';

  get count() {
    return this.#count.value;
  }

  add = () => this.#count.update((n) => n + 1);

  <template>
    <span data-v2-label>{{this.label}}</span>
    <output data-v2-count>{{this.count}}</output>
    <button data-v2-add type="button" {{on "click" this.add}}>add</button>
  </template>
}
