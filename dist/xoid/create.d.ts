import { Init, Atom } from '@xoid/engine';
declare const useable: unique symbol;
export declare type Useable<U> = {
    [useable]: U;
};
export declare const use: <U extends unknown>(store: Useable<U>) => U;
export declare function create<T>(init: Init<T>): Atom<T>;
export declare function create<T, U>(init: Init<T>, useable?: (store: Atom<T>) => U): Atom<T> & Useable<U>;
export {};
