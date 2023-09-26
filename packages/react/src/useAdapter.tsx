import React, { useEffect, createContext } from 'react'
import { setup, InjectionKey, EffectCallback } from 'xoid/setup'
import { useConstant } from './useAtom'
import { createEvent } from '../../xoid/src/internal/lite'

const contextMap = new Map<InjectionKey<any>, React.Context<any>>()
// TODO: This may require revision.
// Instead of multiple kinds of context providers, we may use single provider wrapped, so that it manually
// merges the overrides onto its parents context. so we keep consistency.
// everytime a `context(() => {` opens up, we would run injectMeta maybe
export const createProvider = <T,>(key: InjectionKey<T>, defaultValue: T) => {
  const context = createContext(defaultValue)
  contextMap.set(key, context)
  return context.Provider
}
// The only experimental feature of this package is the `read` method in the following React adapter.
// It relies on the fiber internal: `reactInternals.ReactCurrentDispatcher.current.readContext`.
// This may change in the future, but luckily popular projects like `react-relay`, `preact/compat` also assume it.
// https://github.com/preactjs/preact/blob/cef315a681aaaef67200564d9a33bd007422665b/compat/src/render.js#L230
const reactInternals = (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED

const inject = <T,>(symbol: InjectionKey<T>): T => {
  if (typeof symbol !== 'symbol') throw new TypeError('An injection key should be a symbol.')
  return reactInternals.ReactCurrentDispatcher.current.readContext(contextMap.get(symbol))
}

export const useAdapter = <T,>(fn: () => T) => {
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

  return setup.call(adapter, fn)
}
