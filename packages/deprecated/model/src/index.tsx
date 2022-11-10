import { Init, Store, StateOf } from '@xoid/core'
import { META, RECORD } from '@xoid/engine'
import { createInstance } from '@xoid/core/utils'

export type StoreOf<T> = Store<ExtractLHS<T>> & ExtractRHS<T>

const USABLE = Symbol('use')
const fromShape = (shape: any) =>
  new Proxy(createInstance({ shape }), {
    get(_, prop) {
      if (shape[prop]) return shape[prop]
    },
  })
const memoizedUsables = new WeakMap()

type Merge<T extends any[], U extends any[]> = Array<T[number] & U[number]>

// Fundamental types
export type Usable<U> = { [USABLE]: U }
export type Model<T, U = undefined> = {
  <Q extends T>(state: Q, mutable?: boolean): Store<Q> & Usable<U>
} & Shape<T, Usable<U>>

// Types for models and their returned stores
export type ArrayStore<M extends Model<any, any>> = M extends Model<infer T, infer V>
  ? Store<T[]> & Merge<Store<T>[], Usable<V>[]>
  : never

export type ObjectStore<M extends Model<any, any>> = M extends Model<infer T, infer V>
  ? Store<Record<string, T>> & Record<string, Store<T> & Usable<V>>
  : never

export type ArrayModel<M extends Model<any, any>, U = undefined> = {
  (state: Init<StateOf<ArrayStore<M>>>, mutable?: boolean): ArrayStore<M> & Usable<U>
} & (M extends Model<infer T, infer V> ? Shape<T[], Usable<V>[] & Usable<U>> : never)

export type ObjectModel<M extends Model<any, any>, U = undefined> = {
  (state: Init<StateOf<ObjectStore<M>>>, mutable?: boolean): ObjectStore<M> & Usable<U>
} & (M extends Model<infer T, infer V>
  ? Shape<Record<string, T>, Record<string, Usable<V>> & Usable<U>>
  : never)

export type ComposedModel<T, U = undefined> = {
  <Q extends ExtractLHS<T>>(init: Init<Q>): Store<Q> & ExtractRHS<T> & Usable<U>
} & Shape<ExtractLHS<T>, ExtractRHS<T> & Usable<U>>

// For obtaining deep usables
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
export function model<T, U>(usable?: (store: Store<T>) => U): Model<T, U>
export function model<T, U>(shape: T, usable?: (store: Store<T>) => U): ComposedModel<T, U>

export function model(payload?: any, usable?: any) {
  const isFunction = typeof payload === 'function'
  const shape = { [USABLE]: isFunction ? payload : usable }
  if (!isFunction) Object.assign(shape, payload)
  return fromShape(shape)
}

function wrapped(store: any, o: any) {
  const dh = store[META].root.devtoolsHelper
  return dh ? dh(store, o, []) : o
}

/**
 * Consumes "usables" of stores created via `model`, `arrayOf`, or `objectOf`.
 * @see [xoid.dev/docs/api/use](https://xoid.dev/docs/api/use)
 */

// @ts-ignore
export const use = <T extends any>(store: Usable<T>): T => {
  const attempt = memoizedUsables.get(store)
  if (attempt) return wrapped(store, attempt)
  const shape = (store as any)[META]?.shape
  const usable = shape && shape[USABLE]
  if (typeof usable === 'function') {
    const u = usable(store)
    memoizedUsables.set(store, u)
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
  usable?: (store: ArrayStore<M>) => U
): ArrayModel<M, U> => fromShape({ [USABLE]: usable, [RECORD]: model })

/**
 * Returns a store creator function that receives an object,
 * where each value are models of the specified type.
 * @see [xoid.dev/docs/api/objectof](https://xoid.dev/docs/api/objectof)
 */

export const objectOf = <M extends Model<any, any>, U = undefined>(
  model: M,
  usable?: (store: ObjectStore<M>) => U
): ObjectModel<M, U> => fromShape({ [USABLE]: usable, [RECORD]: model })
