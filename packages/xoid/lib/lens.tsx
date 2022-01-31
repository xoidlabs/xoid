import { META, RECORD } from '@xoid/engine'

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

const createLens = (atom: any, selector: any) => {
  const isPluck =
    typeof selector === 'string' || typeof selector === 'number' || typeof selector === 'symbol'
  const fn = isPluck ? (s: any) => s[selector] : selector

  return function (input?: any) {
    if (arguments.length === 0) return fn(atom())
    const newValue = typeof input === 'function' ? input(fn(atom())) : input
    if (fn(atom()) === newValue) return
    const address = (isPluck ? [selector] : fn(addressProxy([]))[RECORD]) as string[]
    const newState = setDeepValue(atom(), address, newValue)
    atom(newState)
  }
}

const shallowClone = (obj: any) => {
  return Array.isArray(obj)
    ? obj.map((s) => s)
    : Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj))
}
