import React, { useEffect, useLayoutEffect, useDebugValue, Context, createContext } from 'react'
import { create, Atom, InjectionKey, Adapter, EffectCallback } from 'xoid'
import { createEvent } from '../../xoid/src/internal/lite'
import { useConstant } from './useAtom'

export { useAtom } from './useAtom'

// For server-side rendering: https://github.com/react-spring/zustand/pull/34
const useIsoLayoutEffect = window === undefined ? useEffect : useLayoutEffect

export type ReactAdapter = Adapter & {
  read: <T>(context: Context<T>) => T
}

// The only experimental feature of this package is the `read` method in the following React adapter.
// It relies on the fiber internal: `reactInternals.ReactCurrentDispatcher.current.readContext`.
// This may change in the future, but luckily popular projects like `react-relay`, `preact/compat` also assume it.
// https://github.com/preactjs/preact/blob/cef315a681aaaef67200564d9a33bd007422665b/compat/src/render.js#L230
const reactInternals = (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
const useReactAdapter = (props: any): ReactAdapter => {
  const setup = useConstant(() => {
    const m = createEvent()
    const u = createEvent()
    return {
      adapter: {
        read: <T,>(context: Context<T>): T => {
          return reactInternals.ReactCurrentDispatcher.current.readContext(context)
        },
        inject: <T,>(symbol: InjectionKey<T>): T => {
          if (typeof symbol !== 'symbol')
            throw new TypeError('An injection key should be a symbol.')
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
  const api = fn.length > 1 ? useReactAdapter(props) : undefined
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

const contextMap = new Map<InjectionKey<any>, React.Context<any>>()
export const createProvider = <T,>(key: InjectionKey<T>, defaultValue: T) => {
  const context = createContext(defaultValue)
  contextMap.set(key, context)
  return context.Provider
}
