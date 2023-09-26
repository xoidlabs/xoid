import type { Atom, Stream, Init, GetState, Actions } from './internal/types'
import { createSelector, createApi, INTERNAL } from './internal/utils'
import { createInternal } from './internal/lite'

export * from './internal/types'

/**
 * Creates an atom with the first argument as the initial state.
 * Second argument can be used to attach actions to the atom.
 * @see [xoid.dev/docs/quick-tutorial](https://xoid.dev/docs/quick-tutorial)
 */
export function create<T>(): Stream<T>
export function create<T>(init: Init<T>): Atom<T>
export function create<T, U>(init: Init<T>, getActions?: (atom: Atom<T>) => U): Atom<T> & Actions<U>
export function create<T, U = undefined>(init?: Init<T>, getActions?: (atom: Atom<T>) => U) {
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

create.plugins = [] as ((atom: Atom<any>) => void)[]

// the rest of the file is internal stuff
const devtools = {
  send: <T,>(_atom: T) => void 0,
  wrap: <T,>(value: T): T => value,
}

// intentionally untyped
;(create as any).internal = {
  symbol: INTERNAL,
  devtools,
}
