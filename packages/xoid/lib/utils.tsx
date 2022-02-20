import { createTarget, META, parseSelector, RECORD } from '@xoid/engine'
import type { Atom } from '@xoid/engine'

type $A = any

const clone = (obj: any) =>
  Array.isArray(obj)
    ? obj.map((s) => s) // avoid _spread polyfill
    : Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj))

function set<T extends object>(obj: any, path: string[], value: any): T {
  if (!path.length) return value
  const rest = path.map((a) => a)
  const key = rest.shift() as string
  const ans = clone(obj)
  ans[key] = set(obj[key], rest, value)
  return ans
}

function addressProxy(address: string[]): any {
  return new Proxy(
    {},
    {
      get: (_, prop) => {
        if (prop === RECORD) return address
        const newAddress = address.map((s) => s) // avoid _spread polyfill
        newAddress.push(prop as string)
        return addressProxy(newAddress)
      },
    }
  )
}

export const select = (atom: Atom<unknown>, selector: any) => {
  const { isPluck, fn } = parseSelector(selector)
  let address: any

  const target = createTarget(
    () => fn(atom()),
    (value: unknown) =>
      atom((state: unknown) => {
        if (!address) address = (isPluck ? [selector] : fn(addressProxy([]))[RECORD]) as string[]
        return set(state, address, value)
      })
  )
  ;(target as $A)[META] = (atom as $A)[META]
  return target
}
