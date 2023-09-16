import type { Atom, Stream, Init, GetState, Actions, InjectionKey, EffectCallback } from './types'
import { createSelector, createApi, INTERNAL } from './internal/utils'
import { createInternal, createEvent } from './internal/lite'

export * from './types'

/**
 * Creates an atom with the first argument as the initial state.
 * Second argument can be used to attach actions to the atom.
 * @see [xoid.dev/docs/quick-tutorial](https://xoid.dev/docs/quick-tutorial)
 */
export function create<T>(): Stream<T>
export function create<T>(init: Init<T>): Atom<T>
export function create<T, U>(init: Init<T>, getActions?: (atom: Atom<T>) => U): Atom<T> & Actions<U>
export function create<T, U = undefined>(
  init?: Init<T>,
  getActions?: null | ((atom: Atom<T>) => U)
) {
  const isFunction = typeof init === 'function'
  const internal = createInternal(
    (isFunction ? undefined : init) as T,
    (() => devtools.send(atom)) as any
  )
  internal.isStream = !arguments.length
  if (isFunction) createSelector(internal, init as (get: GetState) => T)
  const atom = createApi(internal)
  create.plugins.forEach((fn) => fn(atom))

  const actions = getActions?.(atom)
  Object.defineProperty(atom, 'actions', {
    get() {
      return devtools.wrap(actions)
    },
  })
  return atom
}

export default create
export const inject = <T,>(symbol: InjectionKey<T>): T => (adapter.inject as any)(symbol)
export const effect = (callback: EffectCallback): void => (adapter.effect as any)(callback)

// the rest of the file is internal stuff
create.plugins = [] as ((atom: Atom<any>) => void)[]

const devtools = {
  send: <T,>(_atom: T) => void 0,
  wrap: <T,>(value: T): T => value,
}

/* eslint-disable @typescript-eslint/no-empty-function */
const initialAdapter = {
  effect: () => {},
  inject: () => {},
}

let adapter = initialAdapter

// intentionally untyped
;(create as any).internal = {
  symbol: INTERNAL,
  devtools,
  createEvent,
  intercept: (nextAdapter: any, fn: any) => {
    adapter = nextAdapter
    const result = fn()
    adapter = initialAdapter
    return result
  },
}
