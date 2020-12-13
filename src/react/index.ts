import { useReducer, useEffect, useLayoutEffect, useRef } from 'react'
import { get, set, subscribe, use } from '../core'
import { Decorator, StateOf, Store, Value } from '../core/types'
import { getData, isRootData } from '../core/utils'

// For server-side rendering: https://github.com/react-spring/zustand/pull/34
const useIsoLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect

export type SetState<T> = (
  state: StateOf<T> | ((state: StateOf<T>) => StateOf<T> | Promise<StateOf<T>>),
  decorator?: Decorator<T>
) => void

/**
 * Subscribes to a store, or a value inside a React function component.
 * @see https://xoid.dev/docs/api/use-store
 */

export function useStore(): any
export function useStore<S extends Value<any>>(
  store: S,
  explicitSubscriptions?: true
): S extends Store<infer T, infer A>
  ? [StateOf<T>, A]
  : S extends Value<infer T>
  ? [StateOf<T>, SetState<T>]
  : never

export function useStore(store?: Value<any>, optimizePerformance?: true): any {
  const [, forceUpdate] = useReducer((c) => c + 1, 0) as [never, () => void]
  const unsubsRef = useRef([] as (() => void)[])
  const unsubs = unsubsRef.current
  useIsoLayoutEffect(() => {
    if (store) unsubs.push(subscribe(store, forceUpdate))
    return () => unsubs.forEach((fn) => fn())
  }, [store])

  const getter = (item: any) => (
    unsubs.push(subscribe(item, forceUpdate)), get(item)
  )
  if (typeof store === 'undefined') return getter

  const data = getData(store)
  if (!data)
    throw TypeError(
      '[ xoid ]: Argument of `useStore` should be a Store or a Store member.'
    )

  if (store && !optimizePerformance) {
    data.root.substores.forEach((substore) => {
      // TODO:
      if (addressBeginsWith(substore.address, (data as any).address || []))
        unsubs.push(substore.root.subscribe(forceUpdate))
    })
    if (data.root.model) {
      data.root.getStore().forEach((substoreRoot: Value<unknown>) => {
        unsubs.push(subscribe(substoreRoot, forceUpdate))
      })
    }
  }

  const isStore = isRootData(data)
  const setState = (value: any) => set(store, value)
  return [get(store), isStore ? use(store) || setState : setState]
}

function addressBeginsWith(a: string[], b: string[]) {
  return b.every(function (key, i) {
    return a[i] === key
  })
}
