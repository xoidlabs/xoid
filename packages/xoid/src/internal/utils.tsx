import { createFocus, INTERNAL } from './createFocus'
import { createStream } from './createStream'
import { Atom } from './types'

export type Internal<T> = {
  get: () => T
  set: (value: T) => void
  listeners: Set<() => void>
  subscribe: (listener: () => void) => () => void
  isStream?: boolean
  atom?: Atom<unknown>
  path?: string[]
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

export const subscribeInternal = <T,>(
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
    // this check holds, because sometimes even though root is updated, some branch might be intact.
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

export const createApi = <T,>(internal: Internal<T>) => {
  const { get, set, subscribe, path, atom } = internal
  // Don't delete recurring `api.set` calls from the following code.
  // It lets enhanced atoms work.
  const nextAtom = {
    get value() {
      return get()
    },
    set value(item) {
      nextAtom.set(item)
    },
    set: (value: any) => set(value),
    update: (fn: any) => nextAtom.set(fn(get())),
    subscribe: (item) => subscribeInternal(subscribe, item, get),
    watch: (item) => subscribeInternal(subscribe, item, get, true),

    focus: createFocus(atom ? atom[INTERNAL] : internal, path),
    map: createStream(internal),
    [INTERNAL]: internal,
  } as Atom<T>
  // @ts-ignore
  internal.atom = nextAtom

  return nextAtom
}
