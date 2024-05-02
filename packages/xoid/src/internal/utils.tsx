import create from '..'
import { createFocus, INTERNAL } from './createFocus'
import { createStream } from './createStream'
import type { Atom } from './types'
import { subscribe } from '../core'
import { SHARED } from '../core/shared'

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

export function createAtom<T>(internal: Internal<T>, getActions?: any) {
  const { get, atom } = internal
  // Don't delete recurring `api.set` calls from the following code.
  // It lets enhanced atoms work.
  // if(atom) return atom

  const nextAtom = {
    get value() {
      SHARED.get(nextAtom)
      return get()
    },
    set value(item) {
      nextAtom.set(item)
    },
    get actions() {
      return SHARED.wrap(actions, nextAtom)
    },
    set: (value: any) => internal.set(value),
    update: (fn: any) => nextAtom.set(fn(get())),
    subscribe: (fn: any) => subscribe(internal as any, fn),
    watch: (fn: any) => subscribe(internal as any, fn, true),
    focus: createFocus(atom ? atom[INTERNAL] : internal, internal.path || []),
    // focus: (getPath) => createAtom(focus(internal as any, getPath)),
    map: createStream(internal),
    [INTERNAL]: internal,
  } as Atom<T>
  // @ts-ignore
  internal.atom = nextAtom
  create.plugins.forEach((fn) => fn(nextAtom))
  const actions = getActions && getActions(nextAtom)

  return nextAtom
}
