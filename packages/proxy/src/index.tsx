import { Atom } from 'xoid'

const IS_PROXY = Symbol()

const isPrimitive = (obj: any) =>
  !(typeof obj === 'function' || typeof obj === 'object') || obj === null

const map = new WeakMap()
export const toProxy = <T,>(atom: Atom<T>): T => {
  const { value } = atom
  if (isPrimitive(value)) return value
  if (map.has(atom)) return map.get(atom)

  const target = (Array.isArray(atom.value) ? [] : {}) as Extract<T, object>
  const proxy = new Proxy(target, {
    get(t, key) {
      const nextTarget = atom.value[key]
      if (key === IS_PROXY) return atom
      if (isPrimitive(nextTarget)) return nextTarget
      if (typeof nextTarget === 'function') {
        if (Object.prototype.hasOwnProperty.call(atom.value, key)) {
          console.warn(
            `[@xoid/proxy] Calling functions which are instance variables results in original instance to be mutated.`
          )
        }
        return nextTarget
      }
      return t[key] || (t[key] = toProxy(atom.focus(key as keyof T)))
    },
    set(t, key, nextValue) {
      atom.focus(key as keyof T).set(nextValue)
      return true
    },
  })
  map.set(atom, proxy)
  return proxy
}

export const toAtom = <T,>(proxy: T): Atom<T> => proxy[IS_PROXY]
