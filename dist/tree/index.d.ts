import type { Init, Atom } from '@xoid/engine';
export type { Atom, Init, GetState, Listener, StateOf } from '@xoid/engine';
export declare type AtomTree<T> = Atom<T> & (T extends object ? {
    [K in keyof T]: AtomTree<T[K]>;
} : {});
export declare type Create = {
    <T>(init: Init<T>): AtomTree<T>;
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
export declare const subscribe: <T extends Atom<any>>(store: T, fn: import("../../engine/lib").Listener<import("../../engine/lib").StateOf<T>>) => () => void;
/**
 * Subscribes to an observable. Same to `subscribe`, except it runs the callback immediately.
 * @see [xoid.dev/docs/api/effect](https://xoid.dev/docs/api/effect)
 */
export declare const effect: <T extends Atom<any>>(store: T, fn: import("../../engine/lib").Listener<import("../../engine/lib").StateOf<T>>) => () => void;
