import { error } from './errors'
import { Root } from './root'
import { Decorator, Store, Value } from './types'

// Data storage
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
      // TODO: make a research on alternatives of this
      const obj = Array.isArray(value)
        ? value.map((item) => transform(root, value, item, false))
        : value
      return (value as any)[requestedKey].bind(obj)
    }
  },
  // ownKeys(data: Data) {
  //   return Object.keys(data.source[data.key])
  // },
  // has(data: Data, key) {
  //   const value = data.source[data.key]
  //   return key in value
  // },
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
