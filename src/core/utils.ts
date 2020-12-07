import { error } from './errors'
import { Root } from './root'
import { Store, Value } from './types'

const dataSymbol = Symbol()
type WithData = { [dataSymbol]: any }
export const getData = (obj: Value<unknown>): Data =>
  ((obj as unknown) as WithData)[dataSymbol]

export type Key = string | number
type Data = {
  root: Root<any, unknown>
  source: Record<Key, unknown>
  key: Key
}

export const createHandler = (pure: boolean) => ({
  get(data: Data, requestedKey: Key | typeof dataSymbol) {
    const { root, source, key } = data
    const value = source[key] as Record<Key, unknown>

    // {dataSymbol} is special. It should not create a proxy trap.
    if (requestedKey === dataSymbol) return data

    // only create a new trap for existing keys
    if (Object.hasOwnProperty.call(value, requestedKey)) {
      const nextValue = value[requestedKey]

      // If it's a store, return its already existing proxy
      const nextData = getData(nextValue as Value<unknown>)
      if (nextData) return pure ? nextData.source[nextData.key] : nextValue

      return transform(root, value, requestedKey, pure)
    } else if (value[requestedKey]) {
      console.log('rk ', requestedKey)
      // While using array methods, don't expose values. Instead, return an array of stores
      const obj = Array.isArray(value)
        ? value.map((_item, index) => transform(root, value, index, false))
        : value
      return (value as any)[requestedKey].bind(obj)
    }
  },
  ownKeys(data: Data) {
    return Object.keys(data.source[data.key] as object)
  },
  getOwnPropertyDescriptor() {
    return {
      enumerable: true,
      configurable: true,
    }
  },
  set() {
    throw error('mutation')
  },
})

export const storeHandler = createHandler(false)
export const valueHandler = createHandler(true)

type Transform = <K>(
  root: Root<K, unknown>,
  source: Record<Key, unknown>,
  key: Key,
  pure: boolean
) => Store<K>

export const transform: Transform = (root, source, key, pure) => {
  if (pure && (typeof source[key] !== 'object' || source[key] === null))
    return source[key]
  const data = {
    root,
    source,
    key,
  }
  return new Proxy(data, pure ? valueHandler : storeHandler) as Store<any>
}

export const pure = (data: Data) => {
  const { root, source, key } = data
  return transform(root, source, key, true)
}

export const isRootData = (data: Data) => {
  return data && (data.root as Record<any, any>) === data.source
}

export const getSubstores = (store: Record<string, unknown>) => {
  const substores: { address: string[]; root: Root<unknown, unknown> }[] = []

  const traverse = (obj: Record<string, unknown>, address: string[] = []) => {
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
  traverse(store)
  return substores
}

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
