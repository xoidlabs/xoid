import { useReducer, useEffect, useLayoutEffect, useRef } from 'react'
// @ts-ignore
import { create, subscribe, Store } from '@xoid/core'

// For server-side rendering: https://github.com/react-spring/zustand/pull/34
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

const useConstant = <T extends any>(fn: () => T): T => {
  const ref = useRef<{ c: T }>()
  if (!ref.current) ref.current = { c: fn() }
  return ref.current.c
}

/**
 * Subscribes to a store inside a React function component.
 * @see [xoid.dev/docs/api/usestore](https://xoid.dev/docs/api/usestore)
 */

export function useStore<T>(store: Store<T>): T {
  const forceUpdate = useReducer((c) => c + 1, 0)[1]
  useIsoLayoutEffect(() => subscribe(store, forceUpdate), [])
  return store()
}

/**
 * Runs a setup function only once inside a React function component.
 * Turns the value in the optional second argument to a synced store.
 * @see [xoid.dev/docs/api/uselocal](https://xoid.dev/docs/api/uselocal)
 */

export function useSetup<T>(model: (deps: Store<undefined>) => T): T
export function useSetup<T, P>(model: (deps: Store<P>) => T, props: P): T
export function useSetup(model: (deps: any) => any, props?: any): any {
  const deps = useConstant(() => create(() => props))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => deps(props), [props])
  return useConstant(() => model(deps))
}
