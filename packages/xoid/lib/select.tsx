import { META, RECORD, Atom } from '@xoid/engine'

export function select<T extends unknown, U>(store: Atom<T>, fn: (state: T) => U): Atom<U>
export function select<T extends unknown, U extends keyof T>(store: Atom<T>, fn: U): Atom<T[U]>
export function select(store: any, selector: any) {
  const xoid = function (input?: any) {
    const isPluck = typeof selector === 'string'
    if (isPluck) selector = (s: any) => s[selector]
    if (arguments.length === 0) return selector(store())

    const newValue = typeof input === 'function' ? input(selector(store())) : input
    if (selector(store()) === newValue) return
    const proxy = addressProxy([])
    const address = isPluck ? [selector] : selector(proxy)[RECORD]
    const newState = setDeepValue(store(), address, newValue)
    store(newState)
  }
  // @ts-ignore
  Object.assign(xoid, { [META]: store[META] })
  return xoid as any
}

export const setDeepValue = <T extends Record<string, any>, K extends string[]>(
  obj: T,
  address: K,
  nextValue: any
): T => {
  const a = address.map((s) => s) // avoiding _spread polyfill
  const nextKey = a.shift()
  const nextState = shallowClone(obj)
  ;(nextState as any)[nextKey as string] = a.length
    ? setDeepValue(obj[nextKey as string], a, nextValue)
    : nextValue
  return nextState
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

const shallowClone = (obj: any) => {
  return Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj))
}
