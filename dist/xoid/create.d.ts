import { Init, Atom } from '@xoid/engine';
declare const useable: unique symbol;
export declare type Useable<U> = {
    [useable]: U;
};
/**
 * Gets the "useable"s of an atom.
 * @see [xoid.dev/docs/api/use](https://xoid.dev/docs/api/use)
 */
export declare const use: <U extends unknown>(atom: Useable<U>) => U;
/**
 * Creates an atom with the first argument as the initial state.
 * Second argument can be used too attach "useable"s to the atom.
 * @see [xoid.dev/docs/api/create](https://xoid.dev/docs/api/create)
 */
export declare function create<T>(init: Init<T>): Atom<T>;
export declare function create<T, U>(init: Init<T>, useable?: (atom: Atom<T>) => U): Atom<T> & Useable<U>;
export {};
