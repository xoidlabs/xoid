import { SHARED } from '../core/shared'
import { store, selector, subscribe, focus } from '../core'

import type { StandardConfig, LazyConfig, EnhancedConfig, Store, Config } from '../core/types'
import { Stream, Init, Atom, Actions } from './types'

const createAtom = <T,>(internal: Store<T>, actions) => {
  const { get, set } = internal
  const atom = {
    get,
    set,
    get value() {
      // `xoid/reactive` implicitly collects dependencies using `SHARED.get`
      SHARED.get(this.c)
      return get()
    },
    set value(item) {
      this.set(item)
    },
    get actions() {
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
  <T, U>(init: Init<T>, getActions: () => U): Atom<T> & Actions<U>
  /** If no arguments are supplied, it will produce a {@link Stream} instead of an {@link Atom}. Links have different properties in terms of lazy evaluation. */
  <T>(): Stream<T>
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

// declare const specialPlugin: <T>(
//   atom: Atom<T>,
//   options: { adana: T }
// ) => { produce: (state: T) => void }

// declare const meta: <T, P extends AtomPlugin<any, any>>(config: {
//   plugins: (_type?: T) => P
// }) => (value: Init<T>, options?: PluginOptions<P>) => Atom<T> & Plugins<P>

export const atom = function <T, V>(
  this: Config<T>,
  init: Init<T>,
  options?: { actions?: (atom: Atom<T>) => V }
) {
  const st = (typeof init === 'function' ? selector : store).call(this, init)
  const actions = 
  const atom = createAtom(st,options.actions && options.actions(this))
  for (const plugin in [actionsPlugin]) {
    Object.defineProperties(atom, Object.getOwnPropertyDescriptors(plugin.call(atom, options)))
  }

  return atom
}

// Global plugins
atom.plugins = []
