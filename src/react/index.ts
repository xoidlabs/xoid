import { useReducer } from 'react'
import { subscribe, use, set, get } from '../core'
import { Store, Useable, GetStoreState } from '../core/types'
import { storeMap, useIsoLayoutEffect } from '../core/utils'

export function useStore<G extends Store<any, any> | Useable<any>>(
  store: G
): G extends Store<infer T, infer A>
  ? [GetStoreState<G>, A]
  : G extends Useable<infer T>
  ? [GetStoreState<G>, (value: T | ((state: T) => T)) => void]
  : never {
  const [, forceUpdate] = useReducer((c) => c + 1, 0) as [never, () => void]
  useIsoLayoutEffect(() => {
    const unsubscribe = subscribe(store, forceUpdate)
    return () => unsubscribe()
  }, [store])
  const isStore = storeMap.get(store as object)
  if (isStore) {
    // @ts-ignore
    return [
      get(store as object),
      use(store as any) || ((value: any) => set(store as any, value)),
    ]
  } else {
    // @ts-ignore
    return [get(store as object), (value: any) => set(store as any, value)]
  }
}

export function useStoreEffect<T extends object>(
  store: T,
  fn: (state: GetStoreState<T>) => void
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
