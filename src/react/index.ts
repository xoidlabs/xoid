import { useReducer, ReactChild } from 'react'
import { subscribe, use, get2 } from '../core'
import { Store, List, Observable } from '../core/types'
import { useIsoLayoutEffect } from '../core/utils'

export function useStore<T, A>(store: Store<T, A>): [T, A]
export function useStore<T>(store: Observable<T>): [T] // TODO:
export function useStore<T, A>(store: Store<T, A> | Observable<T>) {
  const [, forceUpdate] = useReducer((c) => c + 1, 0) as [never, () => void]
  useIsoLayoutEffect(() => {
    const unsubscribe = subscribe(store, forceUpdate)
    return () => unsubscribe()
  }, [store])
  return [get2(store), use(store)]
}

export function useStoreEffect<T, A>(
  store: Store<T, A> | List<T>,
  fn: (state: T) => void
): void {
  useIsoLayoutEffect(() => {
    const unsubscribe = subscribe(store as any, fn)
    return () => unsubscribe()
  }, [store])
}

export function X<T>(
  store: Store<T, any> | List<T>,
  fn?: (state: T) => ReactChild
): any {
  const [value] = useStore(store as any)
  if (fn) return fn(value)
  else if (typeof value === 'string' || typeof value === 'number') return value
  else throw TypeError('TODO: invalid type. should be string or number')
}
