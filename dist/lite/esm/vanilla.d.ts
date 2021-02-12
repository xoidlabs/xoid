import { Init, Observable } from '@xoid/engine';
export declare function create<T>(init: Init<T>): Observable<T>;
export declare function create<T, U>(init: Init<T>, useable?: (store: Observable<T>) => U): Observable<T> & Useable<U>;
declare const useable: unique symbol;
export declare type Useable<U> = {
    [useable]: U;
};
export declare const use: <U extends unknown>(store: Useable<U>) => U;
export declare const select: <T extends unknown, U>(store: Observable<T>, fn: (state: T) => U) => Observable<U>;
export declare const setDeepValue: <T extends Record<string, any>, K extends string[]>(obj: T, address: K, newValue: any) => T;
export { subscribe, effect } from '@xoid/engine';
