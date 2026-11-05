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
export declare class TrackedValue<Value = unknown> implements Reactive<Value> {
    #private;
    constructor(value: Value, options: ResolvedOptions<Value>);
    get value(): Value;
    set value(value: Value);
    get get(): () => Value;
    get set(): (value: Value) => boolean;
    get update(): (updater: (value: Value) => Value) => void;
    get freeze(): () => void;
}
export declare function trackedValue<Value>(value: Value, options?: TrackedValueOptions<Value>): TrackedValue<Value>;
export {};
//# sourceMappingURL=tracked-value.d.ts.map