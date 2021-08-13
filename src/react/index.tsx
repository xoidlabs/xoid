import React, {
  useReducer,
  useMemo,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react'
import { create } from '../core'
import { Store, DetransformInner, Value } from '../core/types'
import { watchHelper } from '../core/utils'

// For server-side rendering: https://github.com/react-spring/zustand/pull/34
const useIsoLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect

const useConstant = <T extends any>(fn: () => T): T => {
  const ref = useRef<{ c: T }>()
  if (!ref.current) ref.current = { c: fn() }
  return ref.current.c
}

/**
 * Subscribes to a store, or a value inside a React function component.
 * @see [xoid.dev/docs/api/use-store](https://xoid.dev/docs/api/use-store)
 */

export function useStore<T>(store: Value<T>): DetransformInner<T> {
  const forceUpdate = useReducer((c) => c + 1, 0)[1]
  const [unsubAll, getter] = useMemo(() => watchHelper(store, forceUpdate), [
    store,
    forceUpdate,
  ])
  useIsoLayoutEffect(() => unsubAll)
  return getter()
}

/**
 * Subscribes to a store, or a value inside a React function component.
 * @see [xoid.dev/docs/api/use-local](https://xoid.dev/docs/api/use-local)
 */

export function useLocal<S>(model: () => S): any
export function useLocal<S, P>(model: (deps: Store<P>) => S, props: P): any
export function useLocal<S, P>(
  model: (deps?: Store<P | undefined>) => S,
  props?: P
): any {
  const deps = useConstant(() => create(props))
  const isMounted = useConstant(() => create(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const im = isMounted()
    if (im) deps(props)
    else isMounted(true)
  }, [props])
  return useConstant(() => model(deps))
}

/**
 * Subscribes to a store, or a value inside a React function component.
 * @see [xoid.dev/docs/api/reactive](https://xoid.dev/docs/api/reactive)
 */

const x = (store: Store<string | number>) => {
  return <Xoid store={store} />
}

const Xoid = (props: any) => {
  const state = useStore(props.store)
  return <>{state}</>
}

export default x
