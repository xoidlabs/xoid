import { Init, Atom } from '@xoid/engine';
export { Atom, Init, Listener, StateOf, effect, subscribe } from '@xoid/engine';

declare const useable: unique symbol;
declare type Useable<U> = {
    [useable]: U;
};
/**
 * Gets the "useable"s of an atom.
 * @see [xoid.dev/docs/api/use](https://xoid.dev/docs/api/use)
 */
declare const use: <U extends unknown>(atom: Useable<U>) => U;
/**
 * Creates an atom with the first argument as the initial state.
 * Second argument can be used too attach "useable"s to the atom.
 * @see [xoid.dev/docs/api/create](https://xoid.dev/docs/api/create)
 */
declare function create<T>(init: Init<T>): Atom<T>;
declare function create<T, U>(init: Init<T>, useable?: (atom: Atom<T>) => U): Atom<T> & Useable<U>;

declare type Lens<T> = {
    (): T;
    (value: T): void;
    (fn: (value: T) => T): void;
};
/**
 * Returns a mutable lens from an atom or a plain object
 * @see [xoid.dev/docs/api/select](https://xoid.dev/docs/api/lens)
 */
declare function lens<T extends unknown, U>(a: Atom<T>, fn: (state: T) => U): Lens<U>;
declare function lens<T extends unknown, U extends keyof T>(atom: Atom<T>, fn: U): Lens<T[U]>;
declare function lens<T extends object, U>(object: T, fn: (state: T) => U): Lens<U>;
declare function lens<T extends object, U extends keyof T>(object: T, fn: U): Lens<T[U]>;
/**
 * Focuses to a state partial of an atom. Returns another atom, that forwards changes to the original atom.
 * @see [xoid.dev/docs/api/select](https://xoid.dev/docs/api/select)
 */
declare function select<T extends unknown, U>(atom: Atom<T>, fn: (state: T) => U): Atom<U>;
declare function select<T extends unknown, U extends keyof T>(atom: Atom<T>, fn: U): Atom<T[U]>;

export { Lens, Useable, create, lens, select, use };
