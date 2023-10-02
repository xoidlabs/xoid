// This is a lightweight version of xoid that doesn't have the following features:
// selectors, actions, `focus` and `map` methods.

declare const voidOnly: unique symbol
export type Destructor = () => void | { [voidOnly]: never }

export type LiteAtom<T> = {
  value: T
  set(state: T): void
  update(fn: (state: T) => T): void
  subscribe(fn: (state: T, prevState: T) => void | Destructor): () => void
  watch(fn: (state: T, prevState: T) => void | Destructor): () => void
}

export type Internal<T> = {
  get: () => T
  set: (value: T) => void
  listeners: Set<() => void>
  subscribe: (listener: () => void) => () => void
  isStream?: boolean
  atom?: LiteAtom<unknown>
  cache?: any
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

const subscribeInternal = <T,>(
  subscribe: (listener: () => void) => () => void,
  fn: (state: T, prevState: T) => any,
  getter: () => T,
  watch = false
) => {
  const event = createEvent()
  let prevState = getter()

  const callback = (state: T) => {
    const result = fn(state, prevState)
    if (typeof result === 'function') event.add(result)
  }

  if (watch) callback(prevState)

  const unsubscribe = subscribe(() => {
    const state = getter()
    if (state !== prevState) {
      event.fire()
      callback(state)
      prevState = state
    }
  })

  return () => {
    event.fire()
    unsubscribe()
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
  // Don't delete recurring `api.set` calls from the following code.
  // It lets enhanced atoms work.
  const api: LiteAtom<T> = {
    get value() {
      return get()
    },
    set value(item) {
      api.set(item)
    },
    set: (value: any) => set(value),
    update: (fn: any) => api.set(fn(get())),
    subscribe: (item) => subscribeInternal(subscribe, item, get),
    watch: (item) => subscribeInternal(subscribe, item, get, true),
  }
  return api
}
