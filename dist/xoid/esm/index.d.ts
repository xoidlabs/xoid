import { Atom, Init } from '@xoid/engine';
export { Atom, Init, Listener, StateOf, effect, subscribe } from '@xoid/engine';

declare const usable: unique symbol;
declare type Usable<U> = {
    [usable]: U;
};
declare type Enhancer<T = unknown> = (defaultSetter: (value: T) => void) => (value: T) => void;
/**
 * Gets the "usable" of an atom.
 * When used with the second argument, it selects a partial atom.
 * @see [xoid.dev/docs/api/use](https://xoid.dev/docs/api/use)
 */
declare function use<T extends unknown, U>(atom: Atom<T>, fn: (state: T) => U): Atom<U>;
declare function use<T extends unknown, U extends keyof T>(atom: Atom<T>, fn: U): Atom<T[U]>;
declare function use<T extends any>(atom: Usable<T>): T;
/**
 * Creates an atom with the first argument as the initial state.
 * Second argument can be used too attach "usable"s to the atom.
 * @see [xoid.dev/docs/api/create](https://xoid.dev/docs/api/create)
 */
declare function create<T>(): Atom<T | undefined>;
declare function create<T>(init: Init<T>): Atom<T>;
declare function create<T>(init: Init<T>, usable?: null, enhancer?: Enhancer<T>): Atom<T>;
declare function create<T, U>(init: Init<T>, usable?: (atom: Atom<T>) => U, enhancer?: Enhancer<T>): Atom<T> & Usable<U>;

export { Enhancer, Usable, create, use };
