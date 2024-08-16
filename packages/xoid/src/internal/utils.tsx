import { atom } from '../atom'
import { createEvent } from './createEvent'
import { createFocus, INTERNAL } from './createFocus'
import { createStream } from './createStream'
import { Store } from './store'
import { Atom } from './types'

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

export function createAtom<T>(internal: Store<T>, getActions?: any) {
  const { get, subscribe, atom: a } = internal
  // Don't delete recurring `api.set` calls from the following code.
  // It lets enhanced atoms work.
  const nextAtom = {
    get,
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
    focus: createFocus(a ? a[INTERNAL] : internal, internal.path || []),
    map: createStream(internal),
    [INTERNAL]: internal,
  } as Atom<T>
  // @ts-ignore
  internal.atom = nextAtom
  atom.plugins.forEach((fn) => fn(nextAtom))
  const actions = getActions && getActions(nextAtom)

  return nextAtom
}
