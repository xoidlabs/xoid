import type { Listener, Callback } from '../types'
// This module is self contained, only refers to `./types`.
// it doesn't have the following features: selectors, useables, `focus` and `pass` methods.

export type LiteAtom<T> = {
  value: T
  set(state: T): void
  update(fn: (state: T) => T): void
  subscribe(fn: Listener<T>): () => void
  watch(fn: Listener<T>): () => void
}

export type Internal<T> = {
  get: () => T
  set: (value: T) => void
  listeners: Set<() => void>
  subscribe: (listener: () => void) => () => void
  evaluate?: () => void
  cache?: any
  usable?: any
}

export const INTERNAL = Symbol()

export const createEvent = () => {
  const fns = new Set<Callback>()
  const add = (fn: Callback) => {
    fns.add(fn)
  }
  const fire = () => {
    fns.forEach((fn) => fn())
    fns.clear()
  }
  return { add, fire }
}

const effectize = <T,>(fn: (next: T, prev: T) => any, getter: () => T, watch = false) => {
  const event = createEvent()
  let previous = getter()
  if (watch) fn(previous, previous)
  return () => {
    event.fire()
    const next = getter()
    if (next !== previous) {
      const result = fn(next, previous)
      if (typeof result === 'function') event.add(result)
    }
    previous = next
  }
}

export const createInternal = <T,>(value: T, evaluate?: any): Internal<T> => {
  const listeners = new Set<() => void>()
  return {
    listeners,
    get: () => {
      evaluate?.()
      return value as T
    },
    set: (nextValue: T) => {
      value = nextValue
      listeners.forEach((listener) => listener())
    },
    subscribe: (listener: () => void) => {
      evaluate?.()
      listeners.add(listener)
      return () => void listeners.delete(listener)
    },
  }
}

export const createBaseApi = <T,>(internal: Internal<T>) => {
  const { get, set, subscribe } = internal
  const api: LiteAtom<T> = {
    get value() {
      return get()
    },
    set value(item) {
      set(item)
    },
    set: (value: any) => set(value),
    update: (fn: any) => set(fn(get())),
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
