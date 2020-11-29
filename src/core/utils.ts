import { error } from './errors'
import { Root } from './root'
import { Decorator, Store, Value } from './types'

// Data storage
const dataSymbol = Symbol()
type Covid19 = { [dataSymbol]: any }
const setData = (obj: Value<unknown>, data: TrapData) =>
  (((obj as unknown) as Covid19)[dataSymbol] = data)
export const getData = (obj: Value<unknown>): TrapData =>
  ((obj as unknown) as Covid19)[dataSymbol]

// Other
type Handler = any
export type Key = string | number
export type Address = Key[]
type TrapData = {
  root: Root<any, unknown>
  address: Address
  getValue: () => any
  setValue: (newValue: any, decorator: any) => void
}

const createHandler = () => ({
  get(target: { [dataSymbol]?: any }, key: Key) {
    if (key === (dataSymbol as any)) {
      return target[dataSymbol]
    }
    const { root, getValue, address } = getData(target)
    // only create a new trap for existing keys
    const value = getValue()
    if (value[key]) {
      if (Object.hasOwnProperty.call(value, key)) {
        const data = getData(value[key])
        if (data && !data.address.length) return value[key]
        return transform(
          root,
          [...address, key],
          value[key],
          createSetter(root, value, key),
          this
        )
      } else {
        // return Array.isArray(value)
        //   ? //@ts-ignore
        //     value[key].bind(
        //       value.map((item, i) =>
        //         transform(
        //           root,
        //           [...address, i],
        //           item,
        //           createSetter(root, value, i),
        //           this
        //         )
        //       )
        //     )
        //   : value[key]
      }
    }
  },
  set() {
    throw error('mutation')
  },
})

export const storeHandler = createHandler()
export const valueHandler = createHandler()

type Transform = <K>(
  root: Root<K, unknown>,
  address: Address,
  value: K,
  setValue: (value: K, decorator?: Decorator<K>) => void,
  handler: Handler
) => Store<K>

const transform: Transform = (root, address, value, setValue, handler) => {
  let obj = typeof value === 'object' ? value : {}
  const data = {
    root,
    address,
    getValue() {
      return value
    },
    setValue,
  }
  setData(obj, data)
  return new Proxy(obj, handler) as Store<any>
}

type CreateTrap = <K>(value: Root<K, unknown>, handler: Handler) => Store<K>
export const createTrap: CreateTrap = (root, handler) => {
  const store = transform(
    root,
    [],
    root.state,
    createSetter(root, root, 'state'),
    handler
  )
  return store
}

export const createSetter = (
  root: Root<any, any>,
  object: Record<Key, any>,
  key: Key
) => <T>(
  payload: T | ((state: T) => T | Promise<T>),
  decorator?: Decorator<T>
) => {
  const prevValue: T = object[key]

  if (typeof payload === 'function') {
    // Easy usage of {immer.produce} or other similar functions
    const nextValue: T | Promise<T> = decorator
      ? decorator(prevValue, payload as (state: T) => T | Promise<T>)
      : (payload as (state: T) => T | Promise<T>)(prevValue)

    if (
      // This condition determines if the payload is a promise, by duck typing
      nextValue &&
      typeof (nextValue as Promise<unknown>)?.then === 'function' &&
      typeof (nextValue as Promise<unknown>)?.finally === 'function'
    ) {
      ;(nextValue as Promise<T>).then((promiseResult: T) =>
        root.handleStateChange(object, key, promiseResult)
      )
    } else {
      root.handleStateChange(object, key, nextValue as T)
    }
  } else {
    root.handleStateChange(object, key, payload)
  }
}
