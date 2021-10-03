import { Atom } from '@xoid/engine';
declare type Lens<T> = {
    (): T;
    (value: T): void;
    (fn: (value: T) => T): void;
};
/**
 * Returns a mutable lens from an atom or a plain object
 * @see [xoid.dev/docs/api/select](https://xoid.dev/docs/api/lens)
 */
export declare function lens<T extends unknown, U>(a: Atom<T>, fn: (state: T) => U): Lens<U>;
export declare function lens<T extends unknown, U extends keyof T>(atom: Atom<T>, fn: U): Lens<T[U]>;
export declare function lens<T extends object, U>(object: T, fn: (state: T) => U): Lens<U>;
export declare function lens<T extends object, U extends keyof T>(object: T, fn: U): Lens<T[U]>;
/**
 * Focuses to a state partial of an atom. Returns another atom, that forwards changes to the original atom.
 * @see [xoid.dev/docs/api/select](https://xoid.dev/docs/api/select)
 */
export declare function select<T extends unknown, U>(atom: Atom<T>, fn: (state: T) => U): Atom<U>;
export declare function select<T extends unknown, U extends keyof T>(atom: Atom<T>, fn: U): Atom<T[U]>;
export declare const setDeepValue: <T extends Record<string, any>, K extends string[]>(obj: T, address: K, nextValue: unknown) => T;
export declare const getDeepValue: <T extends Record<string, any>, K extends readonly string[]>(obj: T, address: K) => any;
export {};
