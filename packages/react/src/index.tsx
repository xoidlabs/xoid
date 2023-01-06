import { useSyncExternalStore } from 'use-sync-external-store/shim'
import React, { useEffect, useLayoutEffect, useRef, useDebugValue, Context } from 'react'
import { Atom, Usable, create, use as _use } from 'xoid'

// For server-side rendering: https://github.com/react-spring/zustand/pull/34
const useIsoLayoutEffect = window === undefined ? useEffect : useLayoutEffect

const useConstant = <T extends any>(fn: () => T): T => {
  const ref = useRef<{ c: T }>()
  if (!ref.current) ref.current = { c: fn() }
  return ref.current.c
}

export const createEvent = () => {
  const fns = new Set<Function>()
  const add = (fn: Function) => {
    fns.add(fn)
  }
  const fire = () => {
    fns.forEach((fn) => fn())
    fns.clear()
  }
  return { add, fire }
}

export type ReactAdapter = {
  read: <T>(context: Context<T>) => T
  effect: (fn: React.EffectCallback) => void
}

// The only experimental feature of this package is the `read` method in the following React adapter.
// It relies on React fiber internals that might change in the future. A good thing is that the same
// interface is used by a popular module like `react-relay`, and it's is even mimicked in `preact/compat`.
// https://github.com/preactjs/preact/blob/cef315a681aaaef67200564d9a33bd007422665b/compat/src/render.js#L230
const reactInternals = (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
const useReactAdapter = (): ReactAdapter => {
  const setup = useConstant(() => {
    const m = createEvent()
    const u = createEvent()
    return {
      adapter: {
        read: <T,>(context: Context<T>): T =>
          reactInternals.ReactCurrentDispatcher.current.readContext(context),
        effect: (fn: React.EffectCallback) =>
          m.add(() => {
            const result = fn()
            if (typeof result === 'function') u.add(result)
          }),
      },
      m,
      u,
    }
  })
  useEffect(() => {
    setup.m.fire()
    return () => setup.u.fire()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return setup.adapter
}

/**
 * An atom, or a function returning an atom can be passed as the first argument.
 * When the second optional argument is set to `true`, it will also consume the actions of the atom.
 * @see [xoid.dev/docs/api-react/use-atom](https://xoid.dev/docs/api-react/use-atom)
 */
export function useAtom<T>(atom: Atom<T>): T
export function useAtom<T>(atom: () => Atom<T>): T
export function useAtom<T, U>(atom: Atom<T> & Usable<U>, tuple: true): [T, U]
export function useAtom<T, U>(atom: () => Atom<T> & Usable<U>, tuple: true): [T, U]
export function useAtom<T, U>(maybeAtom: Atom<T> | (() => Atom<T>), tuple?: boolean): [T, U] | T {
  const atom =
    useConstant(() => typeof maybeAtom === 'function' && maybeAtom()) || (maybeAtom as Atom<T>)
  const value = useSyncExternalStore(
    atom.subscribe,
    () => atom.value,
    () => atom.value
  )
  useDebugValue(value)
  return tuple ? ([value, _use(atom as any)] as [T, U]) : (value as T)
}

/**
 * Can be used to create local state inside React components. Similar to `React.useMemo`,
 * but creates values **exactly once**.
 * @see [xoid.dev/docs/api-react/use-setup](https://xoid.dev/docs/api-react/use-setup)
 */
export function useSetup<T>(fn: ($props: undefined, adapter: ReactAdapter) => T): T
export function useSetup<T, P>(fn: ($props: Atom<P>, adapter: ReactAdapter) => T, props: P): T
export function useSetup(fn: ($props: any, adapter: any) => any, props?: any): any {
  /* eslint-disable react-hooks/rules-of-hooks */
  // Calling hooks conditionally wouldn't be an issue here, because we rely on just
  // the Function.length and Arguments.length, which will remain static.
  const api = fn.length > 1 ? useReactAdapter() : undefined
  let result
  if (arguments.length > 1) {
    const $props = useConstant(() => create(() => props))
    useIsoLayoutEffect(() => ($props as Atom<any>).set(props), [props])
    result = useConstant(() => fn($props, api))
  } else {
    result = useConstant(() => fn(undefined, api))
  }
  useDebugValue(result)
  return result
  /* eslint-enable react-hooks/rules-of-hooks */
}
