import { Atom, Init, Listener, StateOf } from '@xoid/engine';
export { Atom, GetState, Init, Listener, StateOf } from '@xoid/engine';

declare type AtomTree<T> = Atom<T> & (T extends object ? {
    [K in keyof T]: AtomTree<T[K]>;
} : {});
declare type Create = {
    <T>(init: Init<T>): AtomTree<T>;
};
/**
 * Creates a store with the first argument as the initial state.
 * Configured for immutable updates by default. Mutable mode can be set by setting second argument to `true`.
 * @see [xoid.dev/docs/api/create](https://xoid.dev/docs/api/create)
 */
declare const create: Create;
/**
 * Subscribes to an observable.
 * @see [xoid.dev/docs/api/subscribe](https://xoid.dev/docs/api/subscribe)
 */
declare const subscribe: <T extends Atom<any>>(store: T, fn: Listener<StateOf<T>>) => () => void;
/**
 * Subscribes to an observable. Same to `subscribe`, except it runs the callback immediately.
 * @see [xoid.dev/docs/api/effect](https://xoid.dev/docs/api/effect)
 */
declare const effect: <T extends Atom<any>>(store: T, fn: Listener<StateOf<T>>) => () => void;

export { AtomTree, Create, create, effect, subscribe };
