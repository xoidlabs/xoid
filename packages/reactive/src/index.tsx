import { create, Atom, Destructor } from 'xoid'

const IS_PROXY = Symbol()

const isPrimitive = (obj: any) =>
  !(typeof obj === 'function' || typeof obj === 'object') || obj === null

declare const reactivity: unique symbol
type ReactiveValue<T> = T extends object ? Reactive<T> : T
export type Reactive<T> = { [reactivity]: never } & (T extends object
  ? { [K in keyof T]: ReactiveValue<T[K]> }
  : T)

const map = new WeakMap()

export const toReactive = <T,>(atom: Atom<T>): Reactive<T> => {
  const { value } = atom
  if (isPrimitive(value)) return value as Reactive<T>
  if (map.has(atom)) return map.get(atom)

  const target = (Array.isArray(atom.value) ? [] : {}) as Extract<T, object>
  const proxy = new Proxy(target, {
    get(t, key) {
      const nextTarget = atom.value[key]
      if (key === IS_PROXY) return atom
      const subAtom = atom.focus(key as keyof T)
      if (trackDependencies) trackDependencies(subAtom)
      if (isPrimitive(nextTarget)) return nextTarget
      if (typeof nextTarget === 'function') {
        if (Object.prototype.hasOwnProperty.call(atom.value, key)) {
          console.warn(
            `[@xoid/proxy] Calling functions which are instance variables results in original instance to be mutated.`
          )
        }
        return nextTarget
      }
      return t[key] || (t[key] = toReactive(subAtom))
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

export const reactive = <T,>(initialValue: T) => toReactive(create(initialValue))

export const toAtom = <T,>(proxy: T): Atom<T> => proxy[IS_PROXY]

let trackDependencies: Function

const intercept = (get, fn) => {
  trackDependencies = get
  const result = fn()
  trackDependencies = undefined
  return result
}

export const watch = (fn: () => void | Destructor) => {
  let cleanup
  const clean = () => {
    if (cleanup && typeof cleanup === 'function') {
      cleanup()
      cleanup = undefined
    }
  }
  const atom = create((get) => {
    clean()
    cleanup = intercept(get, fn)
  })
  const unsub = atom.subscribe(() => 0 as any)
  return () => {
    unsub()
    clean()
  }
}

export const computed = <T,>(fn: () => T): Atom<T> => create((get) => intercept(get, fn))
