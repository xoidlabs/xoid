import { createTarget, META, parseSelector, RECORD } from '@xoid/engine'

const shallowClone = (obj: any) => {
  return Array.isArray(obj)
    ? obj.map((s) => s) // avoid _spread polyfill
    : Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj))
}

const setDeepValue = <T extends Record<string, any>, K extends string[]>(
  obj: T,
  address: K,
  nextValue: unknown
): T => {
  const a = address.map((s) => s) // avoid _spread polyfill
  const nextKey = a.shift() as string
  const nextState = shallowClone(obj)
  if (a.length) nextValue = setDeepValue(obj[nextKey as string], a, nextValue)
  ;(nextState as any)[nextKey as string] = nextValue
  return nextState
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

export const select = (atom: any, selector: any) => {
  const { isPluck, fn } = parseSelector(selector)
  const address = (isPluck ? [selector] : fn(addressProxy([]))[RECORD]) as string[]

  const target = createTarget(
    () => fn(atom()),
    (value: any) => {
      const newState = setDeepValue(atom(), address, value)
      atom(newState)
    }
  )
  ;(target as any)[META] = atom[META]
  return target
}
