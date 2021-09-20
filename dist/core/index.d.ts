import type { Init, Observable } from '@xoid/engine';
export type { Observable, Init, GetState, Listener, StateOf } from '@xoid/engine';
export declare type Store<T> = Observable<T> & (T extends object ? {
    [K in keyof T]: Store<T[K]>;
} : {});
export declare type MutableObservable<T> = Observable<T>;
export declare type MutableStore<T> = MutableObservable<T> & (T extends object ? {
    [K in keyof T]: MutableStore<T[K]>;
} : {});
export declare type Create = {
    <T>(init: Init<T>, mutable?: false): Store<T>;
    <T>(init: Init<T>, mutable: true): MutableStore<T>;
    <T>(): MutableStore<T | undefined>;
};
/**
 * Creates a store with the first argument as the initial state.
 * Configured for immutable updates by default. Mutable mode can be set by setting second argument to `true`.
 * @see [xoid.dev/docs/api/create](https://xoid.dev/docs/api/create)
 */
export declare const create: Create;
/**
 * Subscribes to an observable.
 * @see [xoid.dev/docs/api/subscribe](https://xoid.dev/docs/api/subscribe)
 */
export declare const subscribe: <T extends Observable<any>>(store: T, fn: import("../../engine/lib").Listener<import("../../engine/lib").StateOf<T>>) => () => void;
/**
 * Subscribes to an observable. Same to `subscribe`, except it runs the callback immediately.
 * @see [xoid.dev/docs/api/effect](https://xoid.dev/docs/api/effect)
 */
export declare const effect: <T extends Observable<any>>(store: T, fn: import("../../engine/lib").Listener<import("../../engine/lib").StateOf<T>>) => () => void;
