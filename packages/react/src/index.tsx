import { useSyncExternalStore } from 'use-sync-external-store/shim'
import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useDebugValue,
  Context,
  createContext,
} from 'react'
import { create, Atom, Actions, InjectionKey, Adapter, Component, EffectCallback } from 'xoid'

// For server-side rendering: https://github.com/react-spring/zustand/pull/34
const useIsoLayoutEffect = window === undefined ? useEffect : useLayoutEffect

const useConstant = <T extends any>(fn: () => T): T => {
  const ref = useRef<{ c: T }>()
  if (!ref.current) ref.current = { c: fn() }
  return ref.current.c
}

const createEvent = () => {
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

const contextMap = new Map<InjectionKey<any>, React.Context<any>>()
export const createProvider = <T,>(key: InjectionKey<T>, defaultValue: T) => {
  const context = createContext(defaultValue)
  contextMap.set(key, context)
  return context.Provider
}

export type ReactAdapter = Adapter & {
  read: <T>(context: Context<T>) => T
}

// The only experimental feature of this package is the `read` method in the following React adapter.
// It relies on the fiber internal: `reactInternals.ReactCurrentDispatcher.current.readContext`.
// This may change in the future, but luckily popular projects like `react-relay`, `preact/compat` also assume it.
// https://github.com/preactjs/preact/blob/cef315a681aaaef67200564d9a33bd007422665b/compat/src/render.js#L230
const reactInternals = (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
const useReactAdapter = (): ReactAdapter => {
  const setup = useConstant(() => {
    const m = createEvent()
    const u = createEvent()
    return {
      adapter: {
        read: <T,>(context: Context<T>): T => {
          return reactInternals.ReactCurrentDispatcher.current.readContext(context)
        },
        inject: <T,>(symbol: InjectionKey<T>): T => {
          if (typeof symbol !== 'symbol') throw new Error('An symbol should be used')
          return reactInternals.ReactCurrentDispatcher.current.readContext(contextMap.get(symbol))
        },
        effect: (fn: EffectCallback) =>
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
export function useAtom<T, U>(atom: Atom<T> & Actions<U>, withActions: true): [T, U]
export function useAtom<T, U>(atom: () => Atom<T> & Actions<U>, withActions: true): [T, U]
export function useAtom<T, U>(
  maybeAtom: Atom<T> | (() => Atom<T>),
  withActions?: boolean
): [T, U] | T {
  const atom =
    useConstant(() => typeof maybeAtom === 'function' && maybeAtom()) || (maybeAtom as Atom<T>)
  const value = useSyncExternalStore(
    atom.subscribe,
    () => atom.value,
    () => atom.value
  )
  useDebugValue(value)
  // TODO: reserve the second argument for an equality checker function in the next versions
  return withActions ? ([value, (atom as any).actions] as [T, U]) : (value as T)
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

const toReact =
  <T,>(component: Component<T>) =>
  (props: T) => {
    const render = useSetup(component, props)
    return useAtom(() => create((get) => render(get, React.createElement)))
  }

export default toReact
