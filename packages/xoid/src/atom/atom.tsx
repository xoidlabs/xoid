import { SHARED } from '../core/shared'
import { store, selector, subscribe, focus } from '../core'

import type { StandardConfig, LazyConfig, EnhancedConfig, Store, Config } from '../core/types'
import { Stream, Init, Atom, Actions } from './types'

export type AtomCreator = {
  /** This is the most basic usage of `atom`. The state can be created using a function or a plain value.
   * A function can be used to create derived state.
   * If a function is used as an initializer, it will be lazily evaluated. */
  <T>(init: Init<T>): Atom<T>
  /** You can supply actions for your atoms using the second argument */
  <T, U>(init: Init<T>, actions: (atom: Atom<T>) => U): Atom<T> & Actions<U>
  /** If no arguments are supplied, `atom` will produce a {@link Stream} instead of an {@link Atom}. Strams are atoms that
   *  might not have an immediate value, and they have different properties in terms of lazy evaluation. */
  <T>(): Stream<T>
  bind: AtomBind
  call: AtomCall
}

// TODO: actions arg is missing from these
type AtomBind = {
  <T>(config: StandardConfig<T>): AtomCreator
  <T>(config: EnhancedConfig<T>): AtomCreator
  // I don't know these are the correct types
  <T>(config: LazyConfig<T>): (init?: Init<T>) => Stream<T>
  <T>(config: LazyConfig<T>['subscribe']): (init?: Init<T>) => Stream<T>
}

type AtomCall = {
  <T>(config: StandardConfig<T>): Atom<T>
  <T>(config: EnhancedConfig<T>, init: Init<T>): Atom<T>
  // I don't know these are the correct types
  <T>(config: LazyConfig<T>, init?: Init<T>): Stream<T>
  <T>(config: LazyConfig<T>['subscribe'], init?: Init<T>): Stream<T>
}

const createAtom = <T, U>(baseStore: Store<T>, getActions?: (atom: Atom<T>) => U) => {
  const { get, set } = baseStore
  let actions

  return (
    (baseStore as any).atom ||
    ((baseStore as any).atom = {
      get,
      set,
      get value() {
        // `xoid/tracking` implicitly collects dependencies using `SHARED.get`
        SHARED.get((baseStore as any).atom)
        return get()
      },
      set value(item) {
        this.set(item)
      },
      get actions() {
        if (!actions && getActions)
          actions = (getActions as (atom: Atom<T>) => U)((baseStore as any).atom as Atom<T>)
        // `@xoid/devtools` relies on this wrapper function
        // @ts-expect-error: second arg
        return SHARED.wrap(actions, baseStore.atom)
      },
      update(fn: any) {
        this.set(fn(get()))
      },
      subscribe: (fn) => subscribe(baseStore, fn),
      watch: (fn) => subscribe(baseStore, fn, true),
      map: (getPath) =>
        createAtom(
          store.call({
            get: baseStore.isStream ? undefined : () => getPath(baseStore.get()),
            subscribe: (listener) => baseStore.subscribe((s) => listener(getPath(s))),
          })
        ),
      focus: (getPath) => createAtom(focus(baseStore, getPath)),
    })
  )
}

export const atom = function <T, V>(
  this: Config<T>,
  init: Init<T>,
  actions?: (atom: Atom<T>) => V
) {
  // Pass `this` directly as a base store config.
  const baseStore = (typeof init === 'function' ? selector : store).call(this, init)
  // Mark isStream: true when `atom` is called with zero arguments
  baseStore.isStream = !arguments.length
  return createAtom(baseStore, actions)
} as unknown as AtomCreator

// TODO: Global plugins
// @ts-ignore
atom.plugins = []
