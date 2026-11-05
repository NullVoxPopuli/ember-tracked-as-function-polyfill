import { tracked } from '@glimmer/tracking';

export function createCounter(initial = 0) {
  return tracked(initial, { description: 'v2-addon counter' });
}
