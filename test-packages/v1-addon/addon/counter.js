import { tracked } from '@glimmer/tracking';

export function createCounter(initial = 0) {
  return tracked(initial, { description: 'v1-addon counter' });
}
