import { useReducer, useRef } from 'react'
import { subscribe, use, set, get } from '../core'
import { Store, Useable, GetStoreState } from '../core/types'
import { storeMap, useIsoLayoutEffect, destroy } from '../core/utils'

export function useStore<G extends Store<any, any> | Useable<any>>(
  store: G | (() => G)
): G extends Store<infer T, infer A>
  ? [GetStoreState<G>, A]
  : G extends Useable<infer T>
  ? [GetStoreState<G>, (value: T | ((state: T) => T)) => void]
  : never {
  const ref = useRef<G>()
  if (!ref.current) {
    // @ts-ignore
    ref.current = typeof store === 'function' ? store() : store
  }
  const storeRef = ref.current as Useable<any>
  const [, forceUpdate] = useReducer((c) => c + 1, 0) as [never, () => void]
  useIsoLayoutEffect(() => {
    const unsubscribe = subscribe(storeRef, forceUpdate)
    return () => {
      unsubscribe()
      if (typeof store === 'function') destroy(storeRef)
    }
  }, [storeRef])
  const isStore = storeMap.get(storeRef)
  if (isStore) {
    // @ts-ignore
    return [
      get(storeRef),
      use(storeRef) || ((value: any) => set(storeRef, value)),
    ]
  } else {
    // @ts-ignore
    return [get(storeRef), (value: any) => set(storeRef, value)]
  }
}
