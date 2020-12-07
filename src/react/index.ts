import { useReducer, useEffect, useLayoutEffect } from 'react'
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

export function useStore<S extends Value<any>>(
  store: S
): S extends Value<infer T> | Store<infer T>
  ? [StateOf<T>, SetState<T>]
  : S extends Store<infer T, infer A>
  ? [StateOf<T>, A]
  : never {
  const data = getData(store)
  if (!data)
    throw TypeError(
      '[ @xoid/react ]: Argument of `useStore` should be a Store or a Store member.'
    )
  const isStore = isRootData(data)
  const [, forceUpdate] = useReducer((c) => c + 1, 0) as [never, () => void]
  useIsoLayoutEffect(() => subscribe(store, forceUpdate), [store])
  const setState = (value: any) => set(store, value)
  //@ts-ignore
  return [get(store), isStore ? use(store) || setState : setState]
}
