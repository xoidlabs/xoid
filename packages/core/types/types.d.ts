export declare type Listener<T> = (state: T) => void;
export declare type State<T extends Store<any>> = T extends Store<infer P> ? P : never;
export declare type GetState = <T>(store: Store<T>) => T;
export declare type SetState<T> = (state: T | ((state: T) => T)) => void;
export declare type Init<T> = T | ((get: GetState) => T);
export declare type Value<T> = {
    (): T;
    (state: T): void;
    (fn: (state: T) => T): void;
};
export declare type Store<T> = Value<T> & (T extends object ? {
    [K in keyof T]: Store<T[K]>;
} : {});
export declare type Create = {
    <T extends any>(init: Init<T>, mutable?: boolean): Store<T>;
    <T extends any>(): Store<T>;
};
