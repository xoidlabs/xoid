import { useSyncExternalStore } from 'use-sync-external-store/shim'
import { useEffect, useLayoutEffect, useRef, useMemo, useDebugValue } from 'react'
import { Atom, create } from 'xoid'
import { createCleanup, createReadable, META, OnCleanup } from '@xoid/engine'

// For server-side rendering: https://github.com/react-spring/zustand/pull/34
const useIsoLayoutEffect = window === undefined ? useEffect : useLayoutEffect

const useConstant = <T extends any>(fn: () => T): T => {
  const ref = useRef<{ c: T }>()
  if (!ref.current) ref.current = { c: fn() }
  return ref.current.c
}

const useCleanup = () => {
  const { onCleanup, cleanupAll } = useConstant(createCleanup)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useIsoLayoutEffect(() => cleanupAll, [])
  return onCleanup
}

/**
 * Subscribes to a xoid atom inside a React function component.
 * @see [xoid.dev/docs/api-react/useatom](https://xoid.dev/docs/api-react/useatom)
 */
export function useAtom<T>(atom: Atom<T>): T
export function useAtom<T, U>(atom: Atom<T>, selector: (state: T) => U): U
export function useAtom<T, U extends keyof T>(atom: Atom<T>, selector: U): T[U]
export function useAtom<T, U>(atom: Atom<T>, selector?: keyof T | ((state: T) => U)): any {
  const readable = useMemo(() => createReadable(atom as Atom<T>, selector), [atom, selector])
  const result = useSyncExternalStore(
    (readable as any)[META].notifier.subscribe,
    readable,
    readable
  )
  useDebugValue(result)
  return result
}

/**
 * Can be used to create local state inside React components. Similar to `React.useMemo`.
 * @see [xoid.dev/docs/api-react/usesetup](https://xoid.dev/docs/api-react/usesetup)
 */
export function useSetup<T>(setupFn: (deps: Atom<undefined>, onCleanup: OnCleanup) => T): T
export function useSetup<T, P>(setupFn: (deps: Atom<P>, onCleanup: OnCleanup) => T, props: P): T
export function useSetup(setupFn: (deps: any, onCleanup: any) => any, props?: any): any {
  const $deps = useConstant(() => create(() => props))
  // Don't refactor line 51, because it needs to be strictly `() => props`
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useIsoLayoutEffect(() => $deps(() => props), [props])
  const onCleanup = useCleanup()
  return useConstant(() => setupFn($deps, onCleanup))
}
