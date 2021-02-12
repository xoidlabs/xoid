import { useReducer, useEffect, useLayoutEffect, useRef } from 'react'
import { create, subscribe, select } from './vanilla'
import { Observable } from '@xoid/engine'

// For server-side rendering: https://github.com/react-spring/zustand/pull/34
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

const useConstant = <T extends any>(fn: () => T): T => {
  const ref = useRef<{ c: T }>()
  if (!ref.current) ref.current = { c: fn() }
  return ref.current.c
}

/**
 * Subscribes to a store, or a value inside a React function component.
 * @see [xoid.dev/docs/api-react/usestore](https://xoid.dev/docs/api-react/usestore)
 */

export function useStore<T>(store: Observable<T>): T
export function useStore<T, U>(store: Observable<T>, selector: (state: T) => U): U
export function useStore<T, U>(store: Observable<T>, selector?: (state: T) => U): any {
  const forceUpdate = useReducer((c) => c + 1, 0)[1]
  const item = useConstant(() => {
    return selector ? select(store, selector) : store
  })

  useIsoLayoutEffect(() => subscribe(item, forceUpdate), [])
  return item()
}

/**
 * Subscribes to a store, or a value inside a React function component.
 * @see [xoid.dev/docs/api-react/usesetup](https://xoid.dev/docs/api-react/usesetup)
 */

export function useSetup<T>(
  model: (deps: Observable<undefined>, onCleanup: (fn: () => void) => void) => T
): T
export function useSetup<T, P>(
  model: (deps: Observable<P>, onCleanup: (fn: () => void) => void) => T,
  props: P
): T
export function useSetup(model: (deps: any, onCleanup: any) => any, props?: any): any {
  const setup = useConstant(() => {
    const deps = create(props)
    const fns: any[] = []
    const onCleanup = (fn: any) => fns.push(fn)
    const main = model(deps, onCleanup)
    return { main, deps, fns }
  })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useIsoLayoutEffect(() => setup.deps(props), [props])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useIsoLayoutEffect(() => () => setup.fns.forEach((fn) => fn()), [])
  return setup.main
}
