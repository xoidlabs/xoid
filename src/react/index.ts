import { useReducer, useRef } from 'react'
import { subscribe, use, set, get } from '../core'
import { X, GetStoreState } from '../core/types'
import { storeMap, useIsoLayoutEffect, destroy } from '../core/utils'

export function useStore<G extends X.Store<any, any> | X.Value<any>>(
  store: G | (() => G)
): G extends X.Store<any, infer A>
  ? [GetStoreState<G>, A]
  : G extends X.Value<infer T>
  ? [GetStoreState<G>, (value: T | ((state: T) => T)) => void]
  : never {
  const ref = useRef<G>()
  if (!ref.current) {
    ref.current = typeof store === 'function' ? (store as Function)() : store
  }
  const storeRef = ref.current as X.Value<any>
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
