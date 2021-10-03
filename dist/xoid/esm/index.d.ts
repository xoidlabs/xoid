export type { Init, Atom, Listener, StateOf } from '@xoid/engine';
export type { Useable } from './create';
export { create, use } from './create';
export { select } from './select';
/**
 * Subscribes to an atom.
 * @see [xoid.dev/docs/api/subscribe](https://xoid.dev/docs/api/subscribe)
 */
export declare const subscribe: <T extends import("../../engine/lib").Atom<any>>(store: T, fn: import("../../engine/lib").Listener<import("../../engine/lib").StateOf<T>>) => () => void;
/**
 * Subscribes to an atom. Same to `subscribe`, except it runs the callback immediately.
 * @see [xoid.dev/docs/api/effect](https://xoid.dev/docs/api/effect)
 */
export declare const effect: <T extends import("../../engine/lib").Atom<any>>(store: T, fn: import("../../engine/lib").Listener<import("../../engine/lib").StateOf<T>>) => () => void;
