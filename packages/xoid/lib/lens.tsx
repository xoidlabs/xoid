import { META, RECORD, Atom } from '@xoid/engine'

export type Lens<T> = {
  (): T
  (value: T): void
  (fn: (value: T) => T): void
}

/**
 * Returns a mutable lens from an atom or a plain object
 * @see [xoid.dev/docs/api/select](https://xoid.dev/docs/api/lens)
 */

export function lens<T extends unknown, U>(a: Atom<T>, fn: (state: T) => U): Lens<U>
export function lens<T extends unknown, U extends keyof T>(atom: Atom<T>, fn: U): Lens<T[U]>
export function lens<T extends object, U>(object: T, fn: (state: T) => U): Lens<U>
export function lens<T extends object, U extends keyof T>(object: T, fn: U): Lens<T[U]>
export function lens(object: any, selector: any) {
  const isAtom = Boolean(object[META])
  const atom = isAtom ? object : () => object
  return createLens(atom, selector, true)
}

/**
 * Focuses to a state partial of an atom. Returns another atom, that forwards changes to the original atom.
 * @see [xoid.dev/docs/api/select](https://xoid.dev/docs/api/select)
 */

export function select<T extends unknown, U>(atom: Atom<T>, fn: (state: T) => U): Atom<U>
export function select<T extends unknown, U extends keyof T>(atom: Atom<T>, fn: U): Atom<T[U]>
export function select(atom: any, selector: any) {
  const xoid = createLens(atom, selector)
  // @ts-ignore
  Object.assign(xoid, { [META]: atom[META] })
  return xoid as any
}

const setDeepValue = <T extends Record<string, any>, K extends string[]>(
  obj: T,
  address: K,
  nextValue: unknown
): T => {
  const a = address.map((s) => s) // avoiding _spread polyfill
  const nextKey = a.shift() as string
  const nextState = shallowClone(obj)
  if (a.length) nextValue = setDeepValue(obj[nextKey as string], a, nextValue)
  ;(nextState as any)[nextKey as string] = nextValue
  return nextState
}

const getDeepValue = <T extends Record<string, any>, K extends ReadonlyArray<string>>(
  obj: T,
  address: K
): any => {
  const a = address.map((s) => s) // avoiding _spread polyfill
  const next = a.shift()
  return a.length ? getDeepValue(obj[next as string], a) : obj[next as string]
}

function addressProxy(address: string[]): any {
  return new Proxy(
    {},
    {
      get: (_, prop) => {
        if (prop === RECORD) return address
        const newAddress = address.map((s) => s) // avoiding _spread polyfill
        newAddress.push(prop as string)
        return addressProxy(newAddress)
      },
    }
  )
}

const createLens = (atom: any, selector: any, isLens?: boolean) => {
  const isPluck =
    typeof selector === 'string' || typeof selector === 'number' || typeof selector === 'symbol'
  const fn = isPluck ? (s: any) => s[selector] : selector

  return function (input?: any) {
    if (arguments.length === 0) return fn(atom())
    const newValue = typeof input === 'function' ? input(fn(atom())) : input
    if (fn(atom()) === newValue) return
    const address = (isPluck ? [selector] : fn(addressProxy([]))[RECORD]) as string[]
    if (isLens) {
      const addressWoLastKey = address.map((s) => s)
      const lastKey = addressWoLastKey.pop() as string
      getDeepValue(atom(), addressWoLastKey)[lastKey] = newValue
      return
    }
    const newState = setDeepValue(atom(), address, newValue)
    atom(newState)
  }
}

const shallowClone = (obj: any) => {
  return Array.isArray(obj)
    ? obj.map((s) => s)
    : Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj))
}
