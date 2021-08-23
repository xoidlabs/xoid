import { Init, Store, State } from '@xoid/core'
import { META, RECORD, createInstance } from '@xoid/core/utils'

const USEABLE = Symbol('use') 
const fromShape = (shape: any) => Object.assign(createInstance(shape), shape)
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
  (state: Init<State<ArrayStore<M>>>, mutable?: boolean): ArrayStore<M> & Useable<U>
} & (M extends Model<infer T, infer V> ? Shape<T[], Useable<V>[] & Useable<U>> : never)

export type ObjectModel<M extends Model<any, any>, U = undefined> = {
  (state: Init<State<ObjectStore<M>>>, mutable?: boolean): ObjectStore<M> & Useable<U>
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
 * @example
 * import x from 'xoid';
 *
 * const NumberModel = x(store => ({ inc: () => store(s => s + 1) }))
 * const $num = NumberModel(5)
 * use($num).inc()
 * console.log($num()) // 6
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

/**
 * Consumes "useables" of stores created via `model`, `arrayOf`, or `objectOf`.
 * @see [xoid.dev/docs/api/use](https://xoid.dev/docs/api/use)
 */

// @ts-ignore
export const use = <T extends any>(store: Useable<T>): T => {
  const attempt = memoizedUseables.get(store)
  if (attempt) return attempt
  const shape = (store as any)[META]?.shape
  if (!shape) return undefined as any
  const useable = shape[USEABLE]
  if (typeof useable === 'function') {
    const u = useable(store)
    memoizedUseables.set(store, u)
    return u
  }
}

/**
 * Returns a store creator function that receives an object,
 * where each element is a model of the specified type.
 * @example
 * import x from 'xoid';
 *
 * const NumberModel = x(store => ({ inc: () => store(s => s + 1) }))
 * const NumberArrayModel = x.arrayOf(NumberModel)
 * const $arr = NumberArrayModel([1, 3, 5])
 * $arr.forEach($item => use($item).inc())
 * console.log($arr()) // [2, 4, 6]
 * @see [xoid.dev/docs/api/arrayof](https://xoid.dev/docs/api/arrayof)
 */

export const arrayOf = <M extends Model<any, any>, U = undefined>(
  model: M,
  useable?: (store: ArrayStore<M>) => U
): ArrayModel<M, U> => fromShape({ [USEABLE]: useable, [RECORD]: model })

/**
 * Returns a store creator function that receives an object,
 * where each value are models of the specified type.
 * @example
 * import x from 'xoid';
 *
 * const NumberModel = x(store => ({ inc: () => store(s => s + 1) }))
 * const NumberObjectModel = x.objectOf(NumberModel)
 * const $obj = NumberObjectModel({a: 1, b: 3, c: 5 })
 * Object.entries($obj).forEach([key, $item] => use($item).inc())
 * console.log($obj()) // { a: 2, b: 4, c: 6 }
 * @see [xoid.dev/docs/api/objectof](https://xoid.dev/docs/api/objectof)
 */

export const objectOf = <M extends Model<any, any>, U = undefined>(
  model: M,
  useable?: (store: ObjectStore<M>) => U
): ObjectModel<M, U> => fromShape({ [USEABLE]: useable, [RECORD]: model })
