import { consumeTag, createUpdatableTag, dirtyTag } from '@glimmer/validator';

export interface Reactive<Value> {
  value: Value;
}

export interface ReadOnlyReactive<Value> extends Reactive<Value> {
  readonly value: Value;
}

export interface TrackedValueOptions<Value> {
  equals?: (a: Value, b: Value) => boolean;
  description?: string;
}

interface ResolvedOptions<Value> {
  equals: (a: Value, b: Value) => boolean;
  description: string | undefined;
}

type Tag = ReturnType<typeof createUpdatableTag>;

export class TrackedValue<Value = unknown> implements Reactive<Value> {
  #isFrozen = false;
  #value: Value;
  readonly #options: ResolvedOptions<Value>;
  readonly #tag: Tag;

  #get: (() => Value) | undefined;
  #set: ((value: Value) => boolean) | undefined;
  #update: ((updater: (value: Value) => Value) => void) | undefined;
  #freeze: (() => void) | undefined;

  constructor(value: Value, options: ResolvedOptions<Value>) {
    this.#value = value;
    this.#options = options;
    this.#tag = createUpdatableTag();
  }

  get value(): Value {
    consumeTag(this.#tag);

    return this.#value;
  }

  set value(value: Value) {
    const set = this.#set;

    if (set === undefined) {
      this.#write(value);
    } else {
      set(value);
    }
  }

  get get(): () => Value {
    return (this.#get ??= () => this.value);
  }

  get set(): (value: Value) => boolean {
    return (this.#set ??= (value) => this.#write(value));
  }

  get update(): (updater: (value: Value) => Value) => void {
    return (this.#update ??= (updater) => {
      this.#write(updater(this.#value));
    });
  }

  get freeze(): () => void {
    return (this.#freeze ??= () => {
      this.#isFrozen = true;
    });
  }

  #write(value: Value): boolean {
    if (this.#isFrozen) {
      throw new Error(
        `Cannot update a frozen TrackedValue${
          this.#options.description ? ` (\`${this.#options.description}\`)` : ''
        }`,
      );
    }

    if (this.#options.equals(this.#value, value)) {
      return false;
    }

    this.#value = value;

    dirtyTag(this.#tag);

    return true;
  }
}

const DEFAULT_OPTIONS: ResolvedOptions<unknown> = Object.freeze({
  equals: Object.is,
  description: undefined,
});

export function trackedValue<Value>(
  value: Value,
  options?: TrackedValueOptions<Value>,
): TrackedValue<Value> {
  if (options === undefined) {
    return new TrackedValue(value, DEFAULT_OPTIONS);
  }

  return new TrackedValue(value, {
    equals: options.equals ?? Object.is,
    description: options.description,
  });
}
