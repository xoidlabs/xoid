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

export const tools = {
  symbol: INTERNAL,
  send: () => void 0,
  wrap: (value) => value,
} as {
  get?: Function
  send: <T>(_atom: T) => void
  wrap: <T>(value: T, _atom: Atom<unknown>) => T
}

export const subscribeInternal =
  <T,>(subscribe: (listener: () => void) => () => void, getter: () => T, watch?: boolean) =>
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

export const createInternal = <T,>(value?: T): Internal<T> => {
  const listeners = new Set<() => void>()
  const self = {
    listeners,
    get: () => value as T,
    set: (nextValue: T) => {
      if (value === nextValue) return
      value = nextValue
      // Used by devtools
      tools.send(self)
      listeners.forEach((listener) => listener())
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => void listeners.delete(listener)
    },
  }
  return self
}

export function createAtom<T>(internal: Internal<T>, getActions?: any) {
  const { get, subscribe, atom } = internal
  // Don't delete recurring `api.set` calls from the following code.
  // It lets enhanced atoms work.
  const nextAtom = {
    get value() {
      // @ts-ignore
      tools.get && tools.get(nextAtom)
      return get()
    },
    set value(item) {
      nextAtom.set(item)
    },
    get actions() {
      return tools.wrap(actions, nextAtom)
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
