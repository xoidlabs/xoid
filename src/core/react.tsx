import { useReducer, useMemo, useEffect, useLayoutEffect, useRef } from 'react'
import { META } from './createCell'
import { resolverFactory } from './resolverFactory'
import { DetransformInner, Unsub, Value } from './types'
import { watchHelper } from './utils'

// For server-side rendering: https://github.com/react-spring/zustand/pull/34
const useIsoLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * Subscribes to a store, or a value inside a React function component.
 * @see [xoid.dev/docs/api/use-store](https://xoid.dev/docs/api/use-store)
 */

export function useStore<T>(store: Value<T>): DetransformInner<T> {
  const forceUpdate = useReducer((c) => c + 1, 0)[1]
  const [unsubAll, getter] = useMemo(() => watchHelper(store, forceUpdate), [
    store,
  ])
  useIsoLayoutEffect(() => unsubAll)
  return getter()
}

const useConstant = <T extends any>(fn: () => T): T => {
  const ref = useRef<{ c: T }>()
  if (!ref.current) ref.current = { c: fn() }
  return ref.current.c
}
