import { useReducer, useEffect, useLayoutEffect, useRef } from 'react'
import { create, subscribe, Store } from '../core'

// For server-side rendering: https://github.com/react-spring/zustand/pull/34
const useIsoLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect

const useConstant = <T extends any>(fn: () => T): T => {
  const ref = useRef<{ c: T }>()
  if (!ref.current) ref.current = { c: fn() }
  return ref.current.c
}

/**
 * Subscribes to a store, or a value inside a React function component.
 * @see [xoid.dev/docs/api/use-store](https://xoid.dev/docs/api/use-store)
 */

export function useStore<T>(store: Store<T>): T {
  const forceUpdate = useReducer((c) => c + 1, 0)[1]
  useIsoLayoutEffect(() => subscribe(store, forceUpdate), [])
  return store()
}

/**
 * Subscribes to a store, or a value inside a React function component.
 * @see [xoid.dev/docs/api/use-local](https://xoid.dev/docs/api/use-local)
 */

export function useLocal<T>(model: () => T): T
export function useLocal<T, P>(model: (deps: Store<P>) => T, props: P): T
export function useLocal(model: (deps: any) => any, props?: any): any {
  const deps = useConstant(() => create(props))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => deps(props), [props])
  return useConstant(() => model(deps))
}

const x = (store: Store<string | number>) => {
  return <Xoid store={store} />
}

const Xoid = (props: any) => {
  const state = useStore(props.store)
  return <>{state}</>
}

export default x
