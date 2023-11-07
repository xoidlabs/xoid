import create from '..'
import { createEvent } from './createEvent'
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

export const devtools = {
  send: () => void 0,
  wrap: (value) => value,
} as {
  send: <T>(_atom: T) => void
  wrap: <T>(value: T, _atom: Atom<unknown>) => T
}

export const subscribeInternal =
  <T,>(subscribe: (listener: () => void) => () => void, getter: () => T, watch = false) =>
  (fn: (state: T, prevState: T) => any) => {
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
      send && send?.()
      listeners.forEach((listener) => listener())
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => void listeners.delete(listener)
    },
  }
}

export function createAtom<T>(internal: Internal<T>, getActions?: any) {
  const { get, subscribe, atom } = internal
  // Don't delete recurring `api.set` calls from the following code.
  // It lets enhanced atoms work.
  const nextAtom = {
    get value() {
      return get()
    },
    set value(item) {
      nextAtom.set(item)
    },
    get actions() {
      return devtools.wrap(actions, nextAtom)
    },
    set: (value: any) => internal.set(value),
    update: (fn: any) => nextAtom.set(fn(get())),
    subscribe: subscribeInternal(subscribe, get),
    watch: subscribeInternal(subscribe, get, true),

    focus: createFocus(atom ? atom[INTERNAL] : internal, internal.path || []),
    map: createStream(internal),
    [INTERNAL]: internal,
  } as Atom<T>
  // @ts-ignore
  internal.atom = nextAtom
  create.plugins.forEach((fn) => fn(nextAtom))
  const actions = getActions && getActions(nextAtom)

  return nextAtom
}
