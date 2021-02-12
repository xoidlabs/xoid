import {
  createRoot,
  createSelector,
  createTarget,
  META,
  USEABLE,
  Init,
  Observable,
} from '@xoid/engine'

export function create<T>(init: Init<T>): Observable<T>
export function create<T, U>(
  init: Init<T>,
  useable?: (store: Observable<T>) => U
): Observable<T> & Useable<U>
export function create<T, U = undefined>(
  init: Init<T>,
  useable?: (store: Observable<T>) => U
): Observable<T> {
  const isFunction = typeof init === 'function'
  const meta = { root: createRoot(), node: init }
  const target = createTarget(meta)
  // @ts-ignore
  Object.assign(target, {
    [META]: meta,
    // @ts-ignore
    [USEABLE]: useable && typeof useable === 'function' ? useable(target) : undefined,
  })
  if (isFunction) createSelector(target as unknown as Observable<T>, init as Function)
  return target as any
}

const useable = Symbol()
export type Useable<U> = { [useable]: U }

// @ts-ignore
export const use = <U extends any>(store: Useable<U>): U => store[USEABLE]

export const select = <T extends any, U>(
  store: Observable<T>,
  fn: (state: T) => U
): Observable<U> => {
  const xoid = function (input?: any) {
    if (arguments.length === 0) {
      return fn(store())
    }
    const newValue = typeof input === 'function' ? input(fn(store())) : input
    if (fn(store()) === newValue) return
    surgicallySet(newValue, store, fn)
  }
  // @ts-ignore
  Object.assign(xoid, { [META]: store[META] })
  return xoid as any
}

const ADDRESS = Symbol()
const surgicallySet = (newValue: any, store: any, fn: any) => {
  const proxy = addressProxy([])
  const address = fn(proxy)[ADDRESS] as string[]

  const newState = setDeepValue(store(), address, newValue)
  store(newState)
}

export const setDeepValue = <T extends Record<string, any>, K extends string[]>(
  obj: T,
  address: K,
  newValue: any
): T => {
  const a = address.map((s) => s)
  const next = a.shift()
  const newObj = Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj))
  ;(newObj as any)[next as string] = a.length
    ? setDeepValue(obj[next as string], a, newValue)
    : newValue
  return newObj
}

function addressProxy(address: string[]): any {
  return new Proxy(
    {},
    {
      get: (_, prop) => {
        if (prop === ADDRESS) return address
        const newAddress = address.map((s) => s)
        newAddress.push(prop as string)
        return addressProxy(newAddress)
      },
    }
  )
}

const shallowClone = (obj: any) => {
  if (typeof obj !== 'object' && typeof obj !== 'function') return obj
  return Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj))
}
export { subscribe, effect } from '@xoid/engine'
