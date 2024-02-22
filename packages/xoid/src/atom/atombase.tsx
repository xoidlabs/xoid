import { Init } from './types'
import { store } from '../core/store'

function atomBase<T, U, V>(this: { methods: (options: U) => V }, init: Init<T>, options: U) {
  const base = store.call(this)
  return Object.create(base, Object.getOwnPropertyDescriptors(this.methods.call(base, options)))
}

function extend<T, U extends object, V, W>(left: (l: T) => U, right: (l: V) => W) {
  return (leftOptions: T) => (rightOptions: V) => {
    return Object.create(left(leftOptions), Object.getOwnPropertyDescriptors(right(rightOptions)))
  }
}

const atomBind = extend(store, <T,>(options: { actions: T }) => ({ actions: options.actions }))
// leftoptions set as {}
const atom = atomBind({})

type Something<U> = {
  <T>(value: T, options: U): { get: () => T }
  extend: <T>(newOptions: T) => Something<T>
}

const atom = atomBase.bind({
  methods(a) {
    console.warn(this)

    return {
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
  },
})
