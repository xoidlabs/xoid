import { Atom } from 'xoid'

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
      if (typeof nextTarget === 'function') return nextTarget
      return t[key] || (t[key] = toReactive(atom.focus(key as keyof T)))
    },
    deleteProperty(t, key) {
      delete t[key]
      return true
    },
  })
  map.set(atom, proxy)
  return proxy as Reactive<T>
}
