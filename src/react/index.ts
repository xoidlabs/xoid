import { useReducer, ReactChild } from 'react'
import { subscribe, use, set, get } from '../core'
import { Store, List, Observable, ReverseTransform } from '../core/types'
import { storeMap, useIsoLayoutEffect } from '../core/utils'

export function useStore<G extends Store<any, any> | Observable<any>>(
  store: G
): G extends Store<infer T, infer A>
  ? [ReverseTransform<T>, A]
  : G extends Observable<infer T>
  ? [ReverseTransform<T>, (value: T | ((state: T) => T)) => void]
  : never {
  const [, forceUpdate] = useReducer((c) => c + 1, 0) as [never, () => void]
  useIsoLayoutEffect(() => {
    const unsubscribe = subscribe(store, forceUpdate)
    return () => unsubscribe()
  }, [store])
  // @ts-ignore
  return [
    get(store),
    storeMap.get(store) ? use(store as any) : (value: any) => set(store, value),
  ]
}

export function useStoreEffect<T, A>(
  store: Store<T, A> | List<T>,
  fn: (state: T) => void
): void {
  useIsoLayoutEffect(() => {
    const unsubscribe = subscribe(store as any, fn)
    return () => unsubscribe()
  }, [store])
}

// export function X<T>(
//   store: Store<T, any> | List<T>,
//   fn?: (state: T) => ReactChild
// ): any {
//   const [value] = useStore(store as any)
//   if (fn) return fn(value)
//   else if (typeof value === 'string' || typeof value === 'number') return value
//   else throw TypeError('TODO: invalid type. should be string or number')
// }
