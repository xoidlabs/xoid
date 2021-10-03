import { useReducer, useEffect, useLayoutEffect, useRef, useMemo } from 'react'
// @ts-ignore
import { Atom, subscribe, create, select } from 'xoid'

// For server-side rendering: https://github.com/react-spring/zustand/pull/34
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

const useConstant = <T extends any>(fn: () => T): T => {
  const ref = useRef<{ c: T }>()
  if (!ref.current) ref.current = { c: fn() }
  return ref.current.c
}

/**
 * Subscribes to an xoid atom inside a React function component.
 * @see [xoid.dev/docs/api-react/usestore](https://xoid.dev/docs/api-react/usestore)
 */

export function useAtom<T>(store: Atom<T>): T
export function useAtom<T, U>(store: Atom<T>, selector: (state: T) => U): U
export function useAtom<T, U extends keyof T>(store: Atom<T>, selector: U): T[U]
export function useAtom<T, U>(store: Atom<T>, selector?: (state: T) => U): any {
  const forceUpdate = useReducer((c) => c + 1, 0)[1]
  const item = useMemo(() => {
    return selector ? select(store, selector) : store
  }, [store, selector])

  useIsoLayoutEffect(() => subscribe(item, forceUpdate), [])
  return item()
}

/**
 * Can be used to create local state inside React components. Similar to `React.useMemo`.
 * @see [xoid.dev/docs/api-react/usesetup](https://xoid.dev/docs/api-react/usesetup)
 */

export function useSetup<T>(
  model: (deps: Atom<undefined>, onCleanup: (fn: () => void) => void) => T
): T
export function useSetup<T, P>(
  model: (deps: Atom<P>, onCleanup: (fn: () => void) => void) => T,
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
