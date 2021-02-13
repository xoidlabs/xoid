import { useEffect, useRef } from 'react'
import { create, get, set, Store } from '../core'

const useConstant = <T>(fn: () => T): T => {
  const ref = useRef<{ c: T }>()
  if (!ref.current) ref.current = { c: fn() }
  return ref.current.c
}

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
    if (get(isMounted)) set(deps, props)
    else set(isMounted, true)
  }, [props])
  return useConstant(() => model(deps))
}
