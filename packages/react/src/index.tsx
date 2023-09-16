import React, { useEffect, useLayoutEffect, useDebugValue, createContext } from 'react'
import { create, Atom, InjectionKey, EffectCallback } from 'xoid'
import { useConstant } from './useAtom'

export { useAtom } from './useAtom'

// For server-side rendering: https://github.com/react-spring/zustand/pull/34
const useIsoLayoutEffect = window === undefined ? useEffect : useLayoutEffect

// The only experimental feature of this package is the `read` method in the following React adapter.
// It relies on the fiber internal: `reactInternals.ReactCurrentDispatcher.current.readContext`.
// This may change in the future, but luckily popular projects like `react-relay`, `preact/compat` also assume it.
// https://github.com/preactjs/preact/blob/cef315a681aaaef67200564d9a33bd007422665b/compat/src/render.js#L230
const reactInternals = (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
const { intercept, createEvent } = (create as any).internal

const inject = <T,>(symbol: InjectionKey<T>): T => {
  if (typeof symbol !== 'symbol') throw new TypeError('An injection key should be a symbol.')
  return reactInternals.ReactCurrentDispatcher.current.readContext(contextMap.get(symbol))
}

const useReactAdapter = () => {
  const adapter = useConstant(() => {
    const mount = createEvent()
    const unmount = createEvent()

    return {
      inject,
      effectCallback: () => {
        mount.fire()
        return () => unmount.fire()
      },
      effect: (fn: EffectCallback) =>
        mount.add(() => {
          const result = fn()
          if (typeof result === 'function') unmount.add(result)
        }),
    }
  })

  // eslint-disable-next-line react-hooks/rules-of-hooks, react-hooks/exhaustive-deps
  useEffect(adapter.effectCallback, [])

  return adapter
}

/**
 * Can be used to create local state inside React components. Similar to `React.useMemo`,
 * but creates values **exactly once**.
 * @see [xoid.dev/docs/framework-integrations/use-setup](https://xoid.dev/docs/framework-integrations/use-setup)
 */
export function useSetup<T>(fn: ($props: undefined) => T): T
export function useSetup<T, P>(fn: ($props: Atom<P>) => T, props: P): T
export function useSetup(fn: ($props?: any) => any, props?: any): any {
  // Calling hooks conditionally wouldn't be an issue here, because we rely on just
  // the Function.length, which will remain static.
  /* eslint-disable react-hooks/rules-of-hooks */
  const adapter = useReactAdapter()
  let result
  if (arguments.length > 1) {
    const $props = useConstant(() => create(() => props))
    useIsoLayoutEffect(() => ($props as Atom<any>).set(props), [props])
    result = useConstant(() => intercept(adapter, () => fn($props)))
  } else {
    result = useConstant(() => intercept(adapter, fn))
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
