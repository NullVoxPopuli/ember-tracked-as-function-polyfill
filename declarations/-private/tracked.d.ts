import { type TrackedValue, type TrackedValueOptions } from './tracked-value.ts';
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
type LegacyDecorator = (target: object, key: string, desc?: FieldDescriptor, meta?: unknown, isClassicDecorator?: boolean) => TrackedPropertyDescriptor;
export type TrackedDecorator = PropertyDecorator & LegacyDecorator;
export declare function tracked(options: TrackedDecoratorOptions): TrackedDecorator;
export declare function tracked(target: object, key: string): void;
export declare function tracked(target: object, key: string, desc: FieldDescriptor): TrackedPropertyDescriptor;
export declare function tracked<Value>(initialValue: Value, options?: TrackedValueOptions<Value>): TrackedValue<Value>;
export {};
//# sourceMappingURL=tracked.d.ts.map