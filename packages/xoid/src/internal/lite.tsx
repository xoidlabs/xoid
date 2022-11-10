// This module is self contained. It doesn't have the following features:
// selectors, useables, `focus` and `map` methods.

export type LiteAtom<T> = {
  value: T
  set(state: T): void
  update(fn: (state: T) => T): void
  subscribe(fn: (value: T, previousValue: T) => void): () => void
  watch(fn: (value: T, previousValue: T) => void): () => void
}

export type Internal<T> = {
  get: () => T
  set: (value: T) => void
  listeners: Set<() => void>
  subscribe: (listener: () => void) => () => void
  evaluate?: () => void
  debugValue?: string
  cache?: any
  usable?: any
}

export const createEvent = () => {
  const fns = new Set<Function>()
  const add = (fn: Function) => {
    fns.add(fn)
  }
  const fire = () => {
    fns.forEach((fn) => fn())
    fns.clear()
  }
  return { add, fire }
}

const effectize = <T,>(fn: (state: T, prevState: T) => any, getter: () => T, watch = false) => {
  const event = createEvent()
  let prevState = getter()
  if (watch) fn(prevState, prevState)
  return () => {
    event.fire()
    const state = getter()
    if (state !== prevState) {
      const result = fn(state, prevState)
      if (typeof result === 'function') event.add(result)
    }
    prevState = state
  }
}

export const createInternal = <T,>(value: T, send?: () => void): Internal<T> => {
  const listeners = new Set<() => void>()
  return {
    listeners,
    get: () => value as T,
    set: (nextValue: T) => {
      if (value === nextValue) return
      value = nextValue
      send?.()
      listeners.forEach((listener) => listener())
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => void listeners.delete(listener)
    },
  }
}

export const createBaseApi = <T,>(internal: Internal<T>) => {
  const { get, set, subscribe } = internal
  // Don't delete recurring api destructures from the following code.
  // It lets enhancing atoms work.
  const api: LiteAtom<T> = {
    get value() {
      return get()
    },
    set value(item) {
      api.set(item)
    },
    set: (value: any) => set(value),
    update: (fn: any) => api.set(fn(get())),
    subscribe: (item) => subscribe(effectize(item, get)),
    watch: (item) => subscribe(effectize(item, get, true)),
  }
  return api
}

export function create<T>(): LiteAtom<T | undefined>
export function create<T>(value: T): LiteAtom<T>
export function create<T>(value?: T): LiteAtom<T> {
  return createBaseApi(createInternal(value as T))
}
