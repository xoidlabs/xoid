import { MutableStore, Store } from '@xoid/core';
import { IsObservable } from '@xoid/engine';
export declare type ReadyStore<T> = ReadyObservable<T> & (T extends object ? {
    [K in keyof T]: ReadyStore<T[K]>;
} : {});
export declare type ReadyObservable<T> = {
    (): T | undefined;
    (state: T): void;
    (fn: (state: T) => T): void;
} & IsObservable;
export declare function ready<T extends any>(store: MutableStore<T | undefined>): ReadyStore<T>;
export declare function ready<T extends any>(store: Store<T | undefined>): ReadyStore<T>;
