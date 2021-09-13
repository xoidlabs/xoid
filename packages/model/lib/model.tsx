//@ts-nocheck
import { Init, Store, StateOf } from '@xoid/core'
import { META, RECORD } from '@xoid/engine'
import { createInstance } from '@xoid/core/utils'
//@ts-check

export type StoreOf<T> = Store<ExtractLHS<T>> & ExtractRHS<T>

const USEABLE = Symbol('use')
const fromShape = (shape: any) => Object.assign(createInstance({ shape }), shape)
const memoizedUseables = new WeakMap()

type Merge<T extends any[], U extends any[]> = Array<T[number] & U[number]>

// Fundamental types
export type Useable<U> = { [USEABLE]: U }
export type Model<T, U> = {
  <Q extends T>(state: Q, mutable?: boolean): Store<Q> & Useable<U>
} & Shape<T, Useable<U>>

// Types for models and their returned stores
export type ArrayStore<M extends Model<any, any>> = M extends Model<infer T, infer V>
  ? Store<T[]> & Merge<Store<T>[], Useable<V>[]>
  : never

export type ObjectStore<M extends Model<any, any>> = M extends Model<infer T, infer V>
  ? Store<Record<string, T>> & Record<string, Store<T> & Useable<V>>
  : never

export type ArrayModel<M extends Model<any, any>, U = undefined> = {
  (state: Init<StateOf<ArrayStore<M>>>, mutable?: boolean): ArrayStore<M> & Useable<U>
} & (M extends Model<infer T, infer V> ? Shape<T[], Useable<V>[] & Useable<U>> : never)

export type ObjectModel<M extends Model<any, any>, U = undefined> = {
  (state: Init<StateOf<ObjectStore<M>>>, mutable?: boolean): ObjectStore<M> & Useable<U>
} & (M extends Model<infer T, infer V>
  ? Shape<Record<string, T>, Record<string, Useable<V>> & Useable<U>>
  : never)

// For obtaining deep useables
const SHAPE = Symbol('shape')
type Shape<T, U> = { [SHAPE]: [T, U] }
type ExtractLHS<T> = T extends Shape<infer P, any> ? P : TraverseLHS<T>
type TraverseLHS<T> = T extends object ? { [K in keyof T]: ExtractLHS<T[K]> } : never
type ExtractRHS<T> = T extends Shape<any, infer P> ? P : TraverseRHS<T>
type TraverseRHS<T> = T extends object ? { [K in keyof T]: ExtractRHS<T[K]> } : never

/**
 * Creates a model of the specified type.
 * Returns a store creator function.
 * @see [xoid.dev/docs/api/model](https://xoid.dev/docs/api/model)
 */

export function model<T>(): Model<T, undefined>
export function model<T, U>(useable?: (store: Store<T>) => U): Model<T, U>
export function model<T, U>(
  shape: T,
  useable?: (store: Store<T>) => U
): {
  <Q extends ExtractLHS<T>>(init: Init<Q>): Store<Q> & ExtractRHS<T> & Useable<U>
} & Shape<ExtractLHS<T>, ExtractRHS<T> & Useable<U>>

export function model(payload?: any, useable?: any) {
  const isFunction = typeof payload === 'function'
  const shape = { [USEABLE]: isFunction ? payload : useable }
  if (!isFunction) Object.assign(shape, payload)
  return fromShape(shape)
}

function wrapped(store: any, o: any) {
  const dh = store[META].root.devtoolsHelper
  return dh ? dh(store, o, []) : o
}

/**
 * Consumes "useables" of stores created via `model`, `arrayOf`, or `objectOf`.
 * @see [xoid.dev/docs/api/use](https://xoid.dev/docs/api/use)
 */

// @ts-ignore
export const use = <T extends any>(store: Useable<T>): T => {
  const attempt = memoizedUseables.get(store)
  if (attempt) return wrapped(store, attempt)
  const shape = (store as any)[META]?.shape
  const useable = shape && shape[USEABLE]
  if (typeof useable === 'function') {
    const u = useable(store)
    memoizedUseables.set(store, u)
    return wrapped(store, u)
  }
}

/**
 * Returns a store creator function that receives an object,
 * where each element is a model of the specified type.
 * @see [xoid.dev/docs/api/arrayof](https://xoid.dev/docs/api/arrayof)
 */

export const arrayOf = <M extends Model<any, any>, U = undefined>(
  model: M,
  useable?: (store: ArrayStore<M>) => U
): ArrayModel<M, U> => fromShape({ [USEABLE]: useable, [RECORD]: model })

/**
 * Returns a store creator function that receives an object,
 * where each value are models of the specified type.
 * @see [xoid.dev/docs/api/objectof](https://xoid.dev/docs/api/objectof)
 */

export const objectOf = <M extends Model<any, any>, U = undefined>(
  model: M,
  useable?: (store: ObjectStore<M>) => U
): ObjectModel<M, U> => fromShape({ [USEABLE]: useable, [RECORD]: model })
