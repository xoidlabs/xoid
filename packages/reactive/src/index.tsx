import { create, Atom, Destructor } from 'xoid'

// @ts-ignore
const tools = create.internal

export * from 'xoid'

declare const reactivity: unique symbol
type ReactiveValue<T> = T extends object ? (T extends Function ? T : Reactive<T>) : T
export type Reactive<T> = { [reactivity]: never } & (T extends object
  ? { [K in keyof T]: ReactiveValue<T[K]> }
  : T)

const IS_PROXY = Symbol()

const map = new WeakMap()

const isPrimitive = (obj: any) =>
  !(typeof obj === 'function' || typeof obj === 'object') || obj === null

export const toReactive = <T,>(atom: Atom<T>): Reactive<T> => {
  const { value } = atom
  if (isPrimitive(value)) return value as Reactive<T>
  if (map.has(atom)) return map.get(atom)

  const target = (Array.isArray(atom.value) ? [] : {}) as Extract<T, object>
  const proxy = new Proxy(target, {
    get(t, key) {
      const nextTarget = atom.value[key]
      if (key === IS_PROXY) return atom
      if (isPrimitive(nextTarget)) return nextTarget
      if (typeof nextTarget === 'function') {
        // if (Object.prototype.hasOwnProperty.call(atom.value, key)) {
        //   console.warn(
        //     `[@xoid/reactive] Calling functions which are instance variables results in original instance to be mutated.`
        //   )
        // }
        return nextTarget
      }
      return t[key] || (t[key] = toReactive(atom.focus(key as keyof T)))
    },
    set(t, key, nextValue) {
      atom.focus(key as keyof T).set(nextValue)
      return true
    },
    deleteProperty(t, key) {
      const nextValue = { ...atom.value }
      delete nextValue[key]
      atom.set(nextValue)
      return true
    },
  })
  map.set(atom, proxy)
  return proxy as Reactive<T>
}

export const reactive = <T,>(initialValue: T): Reactive<T> => toReactive(create(initialValue))

export const toAtom = <T,>(proxy: T): Atom<T> => proxy[IS_PROXY]

export const watch = (fn: () => void | Destructor) => {
  let cleanup
  const clean = () => {
    if (cleanup && typeof cleanup === 'function') {
      cleanup()
      cleanup = undefined
    }
  }
  const atom = computed(() => {
    clean()
    cleanup = fn()
  })
  const unsub = atom.subscribe(() => 0 as any)
  return () => {
    unsub()
    clean()
  }
}
// @ts-ignore
const INTERNAL = tools.symbol
export const computed = <T,>(fn: () => T): Atom<T> => {
  const atom = create(fn)
  atom[INTERNAL].track = true
  return atom
}
