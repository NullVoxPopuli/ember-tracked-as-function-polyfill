import {
  setClassicDecorator,
  tracked as nativeTracked,
  TrackedDescriptor,
} from '@ember/-internals/metal';
import { meta as metaFor } from '@ember/-internals/meta';
import { assert } from '@ember/debug';
import { untrack } from '@glimmer/validator';
import { isDevelopingApp, macroCondition } from '@embroider/macros';

import {
  type TrackedValue,
  trackedValue,
  type TrackedValueOptions,
} from './tracked-value.ts';

export interface TrackedDecoratorOptions {
  value?: unknown;
  initializer?: () => unknown;
  equals?: (a: never, b: never) => boolean;
  description?: string;
}

interface FieldDescriptor {
  initializer?: () => unknown;
  value?: unknown;
  get?: () => unknown;
  set?: (value: unknown) => void;
}

interface TrackedPropertyDescriptor {
  enumerable: boolean;
  configurable: boolean;
  get: (this: object) => unknown;
  set: (this: object, value: unknown) => void;
}

type LegacyDecorator = (
  target: object,
  key: string,
  desc?: FieldDescriptor,
  meta?: unknown,
  isClassicDecorator?: boolean,
) => TrackedPropertyDescriptor;

export type TrackedDecorator = PropertyDecorator & LegacyDecorator;

const callNative = nativeTracked as unknown as (...args: unknown[]) => unknown;

const DECORATOR_OPTION_KEYS = ['value', 'initializer', 'equals', 'description'];

function isElementDescriptor(args: unknown[]): boolean {
  const [maybeTarget, maybeKey, maybeDesc] = args;

  return (
    args.length === 3 &&
    (typeof maybeTarget === 'function' ||
      (typeof maybeTarget === 'object' && maybeTarget !== null)) &&
    typeof maybeKey === 'string' &&
    ((typeof maybeDesc === 'object' && maybeDesc !== null) ||
      maybeDesc === undefined)
  );
}

function isModernDecoratorArgs(args: unknown[]): boolean {
  const [, context] = args;

  return (
    args.length === 2 &&
    typeof context === 'object' &&
    context !== null &&
    'kind' in context &&
    'name' in context
  );
}

function isDecoratorOptions(value: unknown): value is TrackedDecoratorOptions {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const proto: unknown = Object.getPrototypeOf(value);

  if (proto !== Object.prototype && proto !== null) {
    return false;
  }

  return Object.keys(value).every((key) => DECORATOR_OPTION_KEYS.includes(key));
}

function withEquals(
  target: object,
  key: string,
  desc: TrackedPropertyDescriptor,
  equals: (a: unknown, b: unknown) => boolean,
): TrackedPropertyDescriptor {
  const { get, set } = desc;

  function setWithEquals(this: object, value: unknown): void {
    if (
      equals(
        untrack(() => get.call(this)),
        value,
      )
    ) {
      return;
    }

    set.call(this, value);
  }

  metaFor(target).writeDescriptors(
    key,
    new TrackedDescriptor(get, setWithEquals),
  );

  return { ...desc, set: setWithEquals };
}

function makeTrackedDecorator(
  options: TrackedDecoratorOptions,
): TrackedDecorator {
  if (macroCondition(isDevelopingApp())) {
    assert(
      `The options object passed to tracked() may only contain a 'value' or an 'initializer' property, not both. Received: [${Object.keys(
        options,
      ).join(',')}]`,
      !('value' in options && 'initializer' in options),
    );

    assert(
      `The initializer passed to tracked must be a function. Received ${String(options.initializer)}`,
      !('initializer' in options) || typeof options.initializer === 'function',
    );

    assert(
      `The 'equals' option passed to tracked must be a function. Received ${String(options.equals)}`,
      !('equals' in options) || typeof options.equals === 'function',
    );

    assert(
      `The 'description' option passed to tracked must be a string. Received ${String(options.description)}`,
      !('description' in options) || typeof options.description === 'string',
    );
  }

  const hasInitialValue = 'value' in options || 'initializer' in options;
  const { initializer, value } = options;
  const equals = options.equals as
    ((a: unknown, b: unknown) => boolean) | undefined;

  const decorator = function (
    target: object,
    key: string,
    desc?: FieldDescriptor,
    _meta?: unknown,
    isClassicDecorator?: boolean,
  ): TrackedPropertyDescriptor {
    assert(
      `You attempted to set a default value for ${key} with the @tracked({ value: 'default' }) syntax. You can only use this syntax with classic classes. For native classes, you can use class initializers: @tracked field = 'default';`,
      isClassicDecorator || !hasInitialValue,
    );

    const fieldDesc: FieldDescriptor | undefined = isClassicDecorator
      ? { initializer: initializer ?? (() => value) }
      : desc;

    const nativeDesc = callNative(
      target,
      key,
      fieldDesc,
    ) as TrackedPropertyDescriptor;

    if (equals === undefined) {
      return nativeDesc;
    }

    return withEquals(target, key, nativeDesc, equals);
  };

  setClassicDecorator(decorator);

  return decorator as unknown as TrackedDecorator;
}

export function tracked(options: TrackedDecoratorOptions): TrackedDecorator;
export function tracked(target: object, key: string): void;
export function tracked(
  target: object,
  key: string,
  desc: FieldDescriptor,
): TrackedPropertyDescriptor;
export function tracked<Value>(
  initialValue: Value,
  options?: TrackedValueOptions<Value>,
): TrackedValue<Value>;
export function tracked(...args: unknown[]): unknown {
  if (args.length >= 3 && isElementDescriptor(args.slice(0, 3))) {
    return callNative(...args);
  }

  if (isModernDecoratorArgs(args)) {
    return callNative(...args);
  }

  if (args.length === 0) {
    return callNative();
  }

  if (args.length === 1 && isDecoratorOptions(args[0])) {
    return makeTrackedDecorator(args[0]);
  }

  const [initialValue, options] = args;

  assert(
    `tracked() may only receive an options object containing 'equals' or 'description' as its second argument, received ${String(options)}`,
    options === undefined || (typeof options === 'object' && options !== null),
  );

  return trackedValue(
    initialValue,
    options as TrackedValueOptions<unknown> | undefined,
  );
}

if (macroCondition(isDevelopingApp())) {
  setClassicDecorator(tracked as never);
}
