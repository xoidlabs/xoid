import { tools } from './utils'

export type StandardConfig<T> = {
  get: () => T
  subscribe(fn: () => void): () => void
  set?: (state: T) => void
}

export type EnhancedConfig<T> = {
  set: (state: T) => void
}

export type LazyConfig<T> = {
  subscribe(fn: (state: T) => void): () => void
  set?: (state: T) => void
}

export type ConfigObject<T> = StandardConfig<T> | LazyConfig<T> | EnhancedConfig<T> | {}

export type Config<T> = ConfigObject<T> | LazyConfig<T>['subscribe']

export type Store<T> = {
  listeners: Set<() => void>
  get: () => T
  set: (state: T) => void
  subscribe(fn: (state: T) => void): () => void

  isStream?: boolean
  atom?: unknown
  path?: string[]
  cache?: any
}

export type LazyStore<T> = {
  listeners: Set<() => void>
  get: () => T | undefined
  set: (state: T) => void
  subscribe(fn: (state: T) => void): () => void
}

export function store<T>(value: T): Store<T>
export function store<T>(): Store<T>
export function store<T>(this: StandardConfig<T>, value: T): Store<T>
export function store<T>(this: EnhancedConfig<T>, value: T): Store<T>
export function store<T>(this: LazyConfig<T>, value?: T): LazyStore<T>
export function store<T>(this: LazyConfig<T>['subscribe'], value?: T): LazyStore<T>
export function store<T>(this: Config<T> | void, value?: T): Store<T> {
  const config = ((typeof this === 'function' ? { subscribe: this } : this) || {}) as Partial<
    Store<T>
  >
  const listeners = new Set<() => void>()
  const {
    get = () => value as T,
    set = (nextValue: T) => {
      if (value === nextValue) return
      value = nextValue
      tools.send(self)
      listeners.forEach((fn) => fn())
    },
    subscribe,
  } = config as Partial<Store<T>>

  let dispose: (() => void) | undefined
  const self = {
    listeners,
    get,
    // get() {
    //   if (config.get) set(config.get())
    //   return value
    // },
    set,
    // The `subscribe` method is never the direct function from the middleware.
    subscribe(fn: (state: T) => void) {
      const listener = () => fn(get())
      // If the base middleware has `get`, prefer that to obtain the state
      if (!listeners.size && subscribe)
        dispose = subscribe((val: T) => set(config.get ? get() : val))
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
        if (!listeners.size && dispose) dispose()
      }
    },
  }
  return self
}
