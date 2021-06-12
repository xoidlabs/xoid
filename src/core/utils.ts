import { error } from './errors'
import { Root } from './root'
import { Store, Value } from './types'

export const dataSymbol = Symbol()
export const getData = (obj: Value<unknown>): Data =>
  (typeof obj === 'object' || typeof obj === 'function') && obj !== null
    ? (obj as any)[dataSymbol]
    : undefined

export type Key = string | number | any
export type Data = {
  root: Root<any, unknown>
  source: Record<Key, unknown>
  key: Key
}

export const createHandler = (pure: boolean, callback?: Function) => ({
  get(data: Data, requestedKey: Key | typeof dataSymbol) {
    // {dataSymbol} is special. It should not create a proxy trap.
    if (requestedKey === dataSymbol && !pure) return data
    const value = data.source[data.key]
    // only create a new trap for existing keys
    if (Object.hasOwnProperty.call(value, requestedKey)) {
      const nextValue = (value as any)[requestedKey]
      // If it's a store, return its already existing proxy
      const nextData = getData(nextValue as Value<unknown>)
      if (nextData) {
        if (pure) {
          callback && callback(nextValue)
          return nextData.source[nextData.key]
        } else {
          return nextValue
        }
      }
      return transform(
        {
          root: data.root,
          source: value as any,
          key: requestedKey,
        },
        pure,
        callback
      )
    } else if ((value as any)[requestedKey]) {
      return (value as any)[requestedKey].bind
        ? (value as any)[requestedKey].bind(
            pure && data ? transform(data, true) : value
          )
        : (value as any)[requestedKey]
    }
  },
  has(data: any, key: any) {
    const value = data.source[data.key]
    return key in value
  },
  ownKeys(data: Data) {
    const value = data.source[data.key]
    return Reflect.ownKeys(value as any)
  },
  getOwnPropertyDescriptor() {
    return {
      enumerable: true,
      configurable: true,
    }
  },
})

export const storeHandler = createHandler(false)
export const valueHandler = createHandler(true)

export const transform = (data: Data, pure: boolean, callback?: any): any => {
  const { source, key } = data
  const isPrimitiveOrFunction =
    typeof source[key] !== 'object' || source[key] === null
  if (pure && isPrimitiveOrFunction) return source[key]

  const handler = callback
    ? createHandler(true, callback)
    : pure
    ? valueHandler
    : storeHandler

  return new Proxy(data, handler) as Store<any>
}

export const isRootData = (data: Data) => {
  return data && (data.root as Record<any, any>) === data.source
}

export const getSubstores = (store: Record<string, unknown>) => {
  const substores: { address: string[]; root: Root<unknown, unknown> }[] = []

  const traverse = (obj: Record<string, unknown>, address: string[] = []) => {
    if (!isComplexObject(store)) {
      const data = getData(obj as Value<unknown>)
      if (isRootData(data)) {
        substores.push({ address, root: data.root })
      } else if (typeof obj === 'object' && obj !== null) {
        Object.keys(obj).forEach((key) => {
          const newAddress = [...address, key]
          traverse(obj[key] as Record<string, unknown>, newAddress)
        })
      }
    }
  }
  traverse(store)
  return substores
}

const isComplexObject = (value: any) =>
  typeof value === 'object' &&
  !['[object Object]', '[object Array]'].includes(
    Object.prototype.toString.call(value)
  )

export const getValueByAddress = (
  obj: any,
  address: string[]
): [any, boolean] => {
  const a = [...address]
  if (a.length) {
    const next = a.shift()
    if (typeof obj === 'object' && obj.hasOwnProperty(next)) {
      return getValueByAddress(obj[next as string], a)
    } else {
      return [null, false]
    }
  } else {
    return [obj, true]
  }
}
