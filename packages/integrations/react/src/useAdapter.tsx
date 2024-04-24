import React, { useEffect, createContext } from 'react'
import { setup, provide } from 'xoid'
import { useConstant } from './useConstant'

// `inject` function, when used with React integration's `useSetup`, relies on the fiber internal:
// `reactInternals.ReactCurrentDispatcher.current.readContext` to obtain the scope symbol. Popular projects
// such as `react-relay`, `preact/compat` also makes use of this fiber internal.
// https://github.com/preactjs/preact/blob/cef315a681aaaef67200564d9a33bd007422665b/compat/src/render.js#L230
const reactInternals = (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED

const SharedScope = Symbol() as symbol

// When in providerless-mode, use the "level one symbol"
const XoidContext = createContext(SharedScope)

const getCurrentSymbol = () =>
  reactInternals.ReactCurrentDispatcher.current.readContext(XoidContext)

export const ScopeProvider = (props: { children: React.ReactChild }) => {
  const symbol = useConstant(() => {
    const currentSymbol = getCurrentSymbol()
    const nextSymbol = Symbol()
    setup.call(nextSymbol, () => {
      // TODO: Inject everything from currentSymbol to nextSymbol
      // provide(currentSymbol)
    })
    return nextSymbol
  })
  return <XoidContext.Provider value={symbol}>{props.children}</XoidContext.Provider>
}

export const useAdapter = <T,>(fn: () => T): T => {
  // We're getting the current symbol in the React context
  const currentSymbol = getCurrentSymbol()
  // We're using that symbol to set to setup as thisArg. This way, when we use xoidReact.Provider,
  // we'll be using the context defined by it.
  const [result, controller] = useConstant(() => setup.call(currentSymbol, fn))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(controller.effect, [])
  return result
}
