import { tracked as nativeTracked } from '@ember/-internals/metal';
import { appEmberSatisfies, macroCondition } from '@embroider/macros';

import { tracked as polyfilledTracked } from './-private/tracked.ts';

export type {
  Reactive,
  ReadOnlyReactive,
  TrackedValue,
  TrackedValueOptions,
} from './-private/tracked-value.ts';
export type { TrackedDecorator } from './-private/tracked.ts';

export const tracked: typeof polyfilledTracked = macroCondition(
  appEmberSatisfies('>= 7.3.0-alpha.1'),
)
  ? (nativeTracked as unknown as typeof polyfilledTracked)
  : polyfilledTracked;
