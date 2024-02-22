import type { Store, LazyStore, StandardConfig, LazyConfig, EnhancedConfig, Config } from './types'

export function store<T>(this: void, value: T): Store<T>
export function store<T>(this: StandardConfig<T>, value: T): Store<T>
export function store<T>(this: EnhancedConfig<T>, value: T): Store<T>
export function store<T>(this: LazyConfig<T>, value?: T): LazyStore<T>
export function store<T>(this: LazyConfig<T>['subscribe'], value?: T): LazyStore<T>
export function store<T>(this: Config<T> | void, value?: T): Store<T> {
  const config = typeof this === 'function' ? { subscribe: this } : this
  const listeners = new Set<() => void>()
  const {
    get = () => value as T,
    set = (nextValue: T) => {
      if (value === nextValue) return
      value = nextValue
      listeners.forEach((fn) => fn())
    },
    subscribe,
  } = config as Partial<Store<T>>

  let dispose
  return {
    listeners,
    get,
    set,
    // The `subscribe` method is never the direct function from the middleware.
    subscribe(fn: (state: T) => void) {
      const listener = () => fn(get())
      // If the base middleware has `get`, prefer that to obtain the state
      if (!listeners.size && subscribe)
        dispose = subscribe((val: T) => set((config as Partial<Store<T>>).get ? get() : val))
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
        if (!listeners.size && dispose) dispose()
      }
    },
  }
}
