import { setClassicDecorator, tracked as tracked$2, TrackedDescriptor } from '@ember/-internals/metal';
import { macroCondition, isDevelopingApp, appEmberSatisfies } from '@embroider/macros';
import { meta } from '@ember/-internals/meta';
import { assert } from '@ember/debug';
import { createUpdatableTag, consumeTag, dirtyTag, untrack } from '@glimmer/validator';

class TrackedValue {
  #isFrozen = false;
  #value;
  #options;
  #tag;
  #get;
  #set;
  #update;
  #freeze;
  constructor(value, options) {
    this.#value = value;
    this.#options = options;
    this.#tag = createUpdatableTag();
  }
  get value() {
    consumeTag(this.#tag);
    return this.#value;
  }
  set value(value) {
    const set = this.#set;
    if (set === undefined) {
      this.#write(value);
    } else {
      set(value);
    }
  }
  get get() {
    return this.#get ??= () => this.value;
  }
  get set() {
    return this.#set ??= value => this.#write(value);
  }
  get update() {
    return this.#update ??= updater => {
      this.#write(updater(this.#value));
    };
  }
  get freeze() {
    return this.#freeze ??= () => {
      this.#isFrozen = true;
    };
  }
  #write(value) {
    if (this.#isFrozen) {
      throw new Error(`Cannot update a frozen TrackedValue${this.#options.description ? ` (\`${this.#options.description}\`)` : ''}`);
    }
    if (this.#options.equals(this.#value, value)) {
      return false;
    }
    this.#value = value;
    dirtyTag(this.#tag);
    return true;
  }
}
const DEFAULT_OPTIONS = Object.freeze({
  equals: Object.is,
  description: undefined
});
function trackedValue(value, options) {
  if (options === undefined) {
    return new TrackedValue(value, DEFAULT_OPTIONS);
  }
  return new TrackedValue(value, {
    equals: options.equals ?? Object.is,
    description: options.description
  });
}

const callNative = tracked$2;
const DECORATOR_OPTION_KEYS = ['value', 'initializer', 'equals', 'description'];
function isElementDescriptor(args) {
  const [maybeTarget, maybeKey, maybeDesc] = args;
  return args.length === 3 && (typeof maybeTarget === 'function' || typeof maybeTarget === 'object' && maybeTarget !== null) && typeof maybeKey === 'string' && (typeof maybeDesc === 'object' && maybeDesc !== null || maybeDesc === undefined);
}
function isModernDecoratorArgs(args) {
  const [, context] = args;
  return args.length === 2 && typeof context === 'object' && context !== null && 'kind' in context && 'name' in context;
}
function isDecoratorOptions(value) {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null) {
    return false;
  }
  return Object.keys(value).every(key => DECORATOR_OPTION_KEYS.includes(key));
}
function withEquals(target, key, desc, equals) {
  const {
    get,
    set
  } = desc;
  function setWithEquals(value) {
    if (equals(untrack(() => get.call(this)), value)) {
      return;
    }
    set.call(this, value);
  }
  meta(target).writeDescriptors(key, new TrackedDescriptor(get, setWithEquals));
  return {
    ...desc,
    set: setWithEquals
  };
}
function makeTrackedDecorator(options) {
  if (macroCondition(isDevelopingApp())) {
    assert(`The options object passed to tracked() may only contain a 'value' or an 'initializer' property, not both. Received: [${Object.keys(options).join(',')}]`, !('value' in options && 'initializer' in options));
    assert(`The initializer passed to tracked must be a function. Received ${String(options.initializer)}`, !('initializer' in options) || typeof options.initializer === 'function');
    assert(`The 'equals' option passed to tracked must be a function. Received ${String(options.equals)}`, !('equals' in options) || typeof options.equals === 'function');
    assert(`The 'description' option passed to tracked must be a string. Received ${String(options.description)}`, !('description' in options) || typeof options.description === 'string');
  }
  const hasInitialValue = 'value' in options || 'initializer' in options;
  const {
    initializer,
    value
  } = options;
  const equals = options.equals;
  const decorator = function (target, key, desc, _meta, isClassicDecorator) {
    assert(`You attempted to set a default value for ${key} with the @tracked({ value: 'default' }) syntax. You can only use this syntax with classic classes. For native classes, you can use class initializers: @tracked field = 'default';`, isClassicDecorator || !hasInitialValue);
    const fieldDesc = isClassicDecorator ? {
      initializer: initializer ?? (() => value)
    } : desc;
    const nativeDesc = callNative(target, key, fieldDesc);
    if (equals === undefined) {
      return nativeDesc;
    }
    return withEquals(target, key, nativeDesc, equals);
  };
  setClassicDecorator(decorator);
  return decorator;
}
function tracked$1(...args) {
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
  assert(`tracked() may only receive an options object containing 'equals' or 'description' as its second argument, received ${String(options)}`, options === undefined || typeof options === 'object' && options !== null);
  return trackedValue(initialValue, options);
}
if (macroCondition(isDevelopingApp())) {
  setClassicDecorator(tracked$1);
}

const tracked = macroCondition(appEmberSatisfies('>= 7.3.0-alpha.1')) ? tracked$2 : tracked$1;

export { tracked };
//# sourceMappingURL=index.js.map
