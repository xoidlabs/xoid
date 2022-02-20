import { Atom, Init } from '@xoid/engine';
export { Atom, Init, Listener, StateOf, effect, subscribe } from '@xoid/engine';

declare const useable: unique symbol;
declare type Useable<U> = {
    [useable]: U;
};
declare type Enhancer<T = unknown> = (defaultSetter: (value: T) => void) => (value: T) => void;
/**
 * Gets the "useable" of an atom.
 * When used with the second argument, it selects a partial atom.
 * @see [xoid.dev/docs/api/use](https://xoid.dev/docs/api/use)
 */
declare function use<T extends unknown, U>(atom: Atom<T>, fn: (state: T) => U): Atom<U>;
declare function use<T extends unknown, U extends keyof T>(atom: Atom<T>, fn: U): Atom<T[U]>;
declare function use<T extends any>(atom: Useable<T>): T;
/**
 * Creates an atom with the first argument as the initial state.
 * Second argument can be used too attach "useable"s to the atom.
 * @see [xoid.dev/docs/api/create](https://xoid.dev/docs/api/create)
 */
declare function create<T>(): Atom<T | undefined>;
declare function create<T>(init: Init<T>): Atom<T>;
declare function create<T>(init: Init<T>, useable?: null, enhancer?: Enhancer<T>): Atom<T>;
declare function create<T, U>(init: Init<T>, useable?: (atom: Atom<T>) => U, enhancer?: Enhancer<T>): Atom<T> & Useable<U>;

export { Enhancer, Useable, create, use };
