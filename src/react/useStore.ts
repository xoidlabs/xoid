import { useReducer, useEffect, useLayoutEffect, useRef } from 'react'
import { get, set, subscribe, use } from '../core'
import { Pure, Store, Value } from '../core/types'
import { getData, isRootData, transform } from '../core/utils'

// For server-side rendering: https://github.com/react-spring/zustand/pull/34
const useIsoLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect

export type SetState<T> = (
  state: Pure<T> | ((state: Pure<T>) => Pure<T> | Promise<Pure<T>>)
) => void

/**
 * Subscribes to a store, or a value inside a React function component.
 * @see [xoid.dev/docs/api/use-store](https://xoid.dev/docs/api/use-store)
 */

export function useStore(): <T>(item: Value<T>) => Pure<T>
export function useStore<S extends Value<any>>(
  store: S
): S extends Store<infer T, infer A>
  ? [Pure<T>, A extends undefined ? SetState<T> : A]
  : S extends Value<infer T>
  ? [Pure<T>, SetState<T>]
  : never

export function useStore(store?: Value<any>): any {
  const forceUpdate = useReducer((c) => c + 1, 0)[1]
  const unsubsRef = useRef<Set<() => void>>()
  if (!unsubsRef.current) unsubsRef.current = new Set<() => void>()
  const unsubs = unsubsRef.current
  useIsoLayoutEffect(() => {
    if (store) unsubs.add(subscribe(store, forceUpdate))
    return () => unsubs.forEach((fn) => fn())
  }, [store])

  if (typeof store === 'undefined')
    return (item: any) => (unsubs.add(subscribe(item, forceUpdate)), get(item))

  const data = getData(store)
  if (!data)
    throw TypeError(
      '[ xoid ]: Argument of `useStore` should be a Store or a Store member.'
    )

  const intercept = () =>
    transform(data, true, (subItem: any) => {
      const subData = getData(subItem)
      unsubs.add(subData.root.subscribe(forceUpdate))
    })

  const isStore = isRootData(data)
  const setState = (value: any) => set(store, value)
  return [intercept(), isStore ? use(store) || setState : setState]
}
