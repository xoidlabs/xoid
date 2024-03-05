import { SHARED } from '../core/shared'
import { store, selector, subscribe, focus } from '../core'

import type { StandardConfig, LazyConfig, EnhancedConfig, Store, Config } from '../core/types'
import { Stream, Init, Atom, Actions } from './types'

const createAtom = <T, U>(internal: Store<T>, getActions?: (atom: Atom<T>) => U) => {
  const { get, set } = internal
  let actions
  const atom = {
    get,
    set,
    get value() {
      // `xoid/tracking` implicitly collects dependencies using `SHARED.get`
      SHARED.get(this.c)
      return get()
    },
    set value(item) {
      this.set(item)
    },
    get actions() {
      if (!actions) actions = (getActions as (atom: Atom<T>) => U)(atom as Atom<T>)
      // `@xoid/devtools` relies on this wrapper function
      return SHARED.wrap(actions, atom)
    },
    update(fn: any) {
      this.set(fn(get()))
    },
    subscribe: (fn) => subscribe(internal, fn),
    watch: (fn) => subscribe(internal, fn, true),
    map: (fn) => createAtom(store(() => internal.subscribe(fn))),
    focus: (fn) => createAtom(focus(internal, fn)),
  }
  return atom
}

type AtomCreator = {
  /** Creates a basic atom using a initializer. If a function is used as an initializer, it will be lazily evaluated. */
  <T>(init: Init<T>): Atom<T>
  /** If a function is supplied in the second argument, it will be used to populate `.actions`.  */
  <T, U>(init: Init<T>, actions: (atom: Atom<T>) => U): Atom<T> & Actions<U>
}

type StreamCreator = {
  /** If no arguments are supplied, it will produce a {@link Stream} instead of an {@link Atom}. Strams are atoms that
   *  might not have an immediate value, and they have different properties in terms of lazy evaluation. */
  <T>(): Stream<T>
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

// type A = {
//   bind<T, P>(config: {
//     plugins: (_type?: T) => P[]
//   }): <A>(
//     value: Init<T>,
//     options?: { actions?: A } & PluginOptions<P>
//   ) => Atom<T> & Plugins<P> & Actions<A>

//   bind<T, P>(config: StandardConfig<T, P>): (value: Init<T>) => Atom<T> & Plugins<P>
//   bind<T, P>(config: EnhancedConfig<T, P>): (value: Init<T>) => Atom<T> & Plugins<P>
//   bind<T, P>(config: LazyConfig<T, P>): (value?: Init<T>) => Stream<T> & Plugins<P>
//   bind<T, P>(config: LazyConfig<T, P>['subscribe']): (value?: Init<T>) => Stream<T> & Plugins<P>

//   call<T, P>(config: StandardConfig<T, P>, value: Init<T>): Atom<T> & Plugins<P>
//   call<T, P>(config: EnhancedConfig<T, P>, value: Init<T>): Atom<T> & Plugins<P>
//   call<T, P>(config: LazyConfig<T, P>, value?: Init<T>): Stream<T> & Plugins<P>
//   call<T, P>(config: LazyConfig<T, P>['subscribe'], value?: Init<T>): Stream<T> & Plugins<P>

//   plugins: AtomPlugin[]
// }

export const atom: AtomCreator = function <T, V>(
  this: Config<T>,
  init: Init<T>,
  actions?: (atom: Atom<T>) => V
) {
  const st = (typeof init === 'function' ? selector : store).call(this, init)
  return createAtom(st, actions)
}

bind()
// Global plugins
atom.plugins = []
