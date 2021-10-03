import { Atom } from '@xoid/engine';
export declare function select<T extends unknown, U>(store: Atom<T>, fn: (state: T) => U): Atom<U>;
export declare function select<T extends unknown, U extends keyof T>(store: Atom<T>, fn: U): Atom<T[U]>;
export declare const setDeepValue: <T extends Record<string, any>, K extends string[]>(obj: T, address: K, nextValue: any) => T;
