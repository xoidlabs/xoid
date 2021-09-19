import { Init, Store, StateOf } from '@xoid/core';
export declare type StoreOf<T> = Store<ExtractLHS<T>> & ExtractRHS<T>;
declare const USEABLE: unique symbol;
declare type Merge<T extends any[], U extends any[]> = Array<T[number] & U[number]>;
export declare type Useable<U> = {
    [USEABLE]: U;
};
export declare type Model<T, U = undefined> = {
    <Q extends T>(state: Q, mutable?: boolean): Store<Q> & Useable<U>;
} & Shape<T, Useable<U>>;
export declare type ArrayStore<M extends Model<any, any>> = M extends Model<infer T, infer V> ? Store<T[]> & Merge<Store<T>[], Useable<V>[]> : never;
export declare type ObjectStore<M extends Model<any, any>> = M extends Model<infer T, infer V> ? Store<Record<string, T>> & Record<string, Store<T> & Useable<V>> : never;
export declare type ArrayModel<M extends Model<any, any>, U = undefined> = {
    (state: Init<StateOf<ArrayStore<M>>>, mutable?: boolean): ArrayStore<M> & Useable<U>;
} & (M extends Model<infer T, infer V> ? Shape<T[], Useable<V>[] & Useable<U>> : never);
export declare type ObjectModel<M extends Model<any, any>, U = undefined> = {
    (state: Init<StateOf<ObjectStore<M>>>, mutable?: boolean): ObjectStore<M> & Useable<U>;
} & (M extends Model<infer T, infer V> ? Shape<Record<string, T>, Record<string, Useable<V>> & Useable<U>> : never);
export declare type ComposedModel<T, U = undefined> = {
    <Q extends ExtractLHS<T>>(init: Init<Q>): Store<Q> & ExtractRHS<T> & Useable<U>;
} & Shape<ExtractLHS<T>, ExtractRHS<T> & Useable<U>>;
declare const SHAPE: unique symbol;
declare type Shape<T, U> = {
    [SHAPE]: [T, U];
};
declare type ExtractLHS<T> = T extends Shape<infer P, any> ? P : TraverseLHS<T>;
declare type TraverseLHS<T> = T extends object ? {
    [K in keyof T]: ExtractLHS<T[K]>;
} : never;
declare type ExtractRHS<T> = T extends Shape<any, infer P> ? P : TraverseRHS<T>;
declare type TraverseRHS<T> = T extends object ? {
    [K in keyof T]: ExtractRHS<T[K]>;
} : never;
/**
 * Creates a model of the specified type.
 * Returns a store creator function.
 * @see [xoid.dev/docs/api/model](https://xoid.dev/docs/api/model)
 */
export declare function model<T>(): Model<T, undefined>;
export declare function model<T, U>(useable?: (store: Store<T>) => U): Model<T, U>;
export declare function model<T, U>(shape: T, useable?: (store: Store<T>) => U): ComposedModel<T, U>;
/**
 * Consumes "useables" of stores created via `model`, `arrayOf`, or `objectOf`.
 * @see [xoid.dev/docs/api/use](https://xoid.dev/docs/api/use)
 */
export declare const use: <T extends unknown>(store: Useable<T>) => T;
/**
 * Returns a store creator function that receives an object,
 * where each element is a model of the specified type.
 * @see [xoid.dev/docs/api/arrayof](https://xoid.dev/docs/api/arrayof)
 */
export declare const arrayOf: <M extends Model<any, any>, U = undefined>(model: M, useable?: ((store: ArrayStore<M>) => U) | undefined) => ArrayModel<M, U>;
/**
 * Returns a store creator function that receives an object,
 * where each value are models of the specified type.
 * @see [xoid.dev/docs/api/objectof](https://xoid.dev/docs/api/objectof)
 */
export declare const objectOf: <M extends Model<any, any>, U = undefined>(model: M, useable?: ((store: ObjectStore<M>) => U) | undefined) => ObjectModel<M, U>;
export {};
