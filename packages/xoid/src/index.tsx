import type { Atom, Stream, Init, GetState, Actions } from './types'
import { createSelector, createApi, INTERNAL } from './internal/utils'
import { createInternal } from './internal/lite'

export * from './types'

/**
 * Creates an atom with the first argument as the initial state.
 * Second argument can be used to attach actions to the atom.
 * @see [xoid.dev/docs/quick-tutorial](https://xoid.dev/docs/quick-tutorial)
 */
export function create<T>(): Stream<T>
export function create<T>(init: Init<T>): Atom<T>
export function create<T>(init: Init<T>, getActions: null): Atom<T>
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

/**
 * @deprecated In the next versions, `use` will be removed in favor of `atom.actions`.
 */
export const use = <T extends any>(atom: Actions<T>): T => atom.actions

const devtools = {
  send: <T,>(_atom: T) => void 0,
  wrap: <T,>(value: T): T => value,
}

// untyped
const _create = create as any
_create.symbol = INTERNAL
_create.devtools = devtools
// typed
create.plugins = [] as ((atom: Atom<any>) => void)[]
