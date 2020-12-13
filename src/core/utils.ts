import { error } from './errors'
import { Root } from './root'
import { Store, Value } from './types'

const dataMap = new WeakMap()

const dataSymbol = Symbol()
type WithData = { [dataSymbol]: any }
const setData = (obj: any, data: Data) => {
  dataMap.set(obj, data)
}
export const getData = (obj: Value<unknown>): Data =>
  ((obj as unknown) as WithData)[dataSymbol]

export type Key = string | number
type Data = {
  root: Root<any, unknown>
  source: Record<Key, unknown>
  key: Key
}

export const createHandler = (pure: boolean) => ({
  get(target: Record<Key, unknown>, requestedKey: Key | typeof dataSymbol) {
    const data = dataMap.get(target)
    const { root } = data
    // {dataSymbol} is special. It should not create a proxy trap.
    if (requestedKey === dataSymbol) return data

    // only create a new trap for existing keys
    if (Object.hasOwnProperty.call(target, requestedKey)) {
      const nextValue = target[requestedKey]

      // If it's a store, return its already existing proxy
      const nextData = getData(nextValue as Value<unknown>)
      if (nextData) return pure ? nextData.source[nextData.key] : nextValue

      return transform(root, target, requestedKey, pure)
    } else if (target[requestedKey]) {
      return (target as any)[requestedKey].bind(target)
    }
  },
  set(target: Record<Key, unknown>, key: Key, value: unknown) {
    if (!pure) throw error('mutation')
    else target[key] = value
    return true
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
  const isPrimitive = typeof source[key] !== 'object' || source[key] === null
  if (pure && isPrimitive) return source[key]
  const data = {
    root,
    source,
    key,
  }
  const target = isPrimitive ? {} : (source[key] as object)
  setData(target, data)
  return new Proxy(target, pure ? valueHandler : storeHandler) as Store<any>
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

export function addressBeginsWith(a: string[], b: string[]) {
  return b.every(function (key, i) {
    return a[i] === key
  })
}

export const override = (
  target: Record<string, unknown>,
  payload: Record<string, unknown>
) => {
  // delete all keys
  Object.keys(target).forEach((key) => delete target[key])
  // shallowmerge it to the object
  Object.keys(payload).forEach((key) => (target[key] = payload[key]))
}
