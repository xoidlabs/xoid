import { error } from './errors'
import { Root } from './root'
import { Store, Value } from './types'

const dataMap = new WeakMap()
const dataSymbol = Symbol()
const setData = (obj: any, data: Data) => {
  dataMap.set(obj, data)
}
export const getData = (obj: Value<unknown>): Data =>
  (typeof obj === 'object' || typeof obj === 'function') && obj !== null
    ? (obj as any)[dataSymbol]
    : undefined

export type Key = string | number
export type Data = {
  root: Root<any, unknown>
  source: Record<Key, unknown>
  key: Key
}

export const createHandler = (pure: boolean, callback?: Function) => ({
  get(target: Record<Key, unknown>, requestedKey: Key | typeof dataSymbol) {
    const data: Data = dataMap.get(target)
    // {dataSymbol} is special. It should not create a proxy trap.
    if (requestedKey === dataSymbol) return data

    // only create a new trap for existing keys
    if (Object.hasOwnProperty.call(target, requestedKey)) {
      const nextValue = target[requestedKey]

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
        { root: data.root, source: target, key: requestedKey },
        pure,
        callback
      )
    } else if (target[requestedKey]) {
      return (target as any)[requestedKey].bind
        ? (target as any)[requestedKey].bind(
            pure && data ? transform(data, true) : target
          )
        : (target as any)[requestedKey]
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

export const transform = (data: Data, pure: boolean, callback?: any): any => {
  const { source, key } = data
  const isPrimitive = typeof source[key] !== 'object' || source[key] === null
  if (pure && isPrimitive) return source[key]

  const target = isPrimitive ? {} : (source[key] as object)
  setData(target, data)
  const handler = callback
    ? createHandler(true, callback)
    : pure
    ? valueHandler
    : storeHandler
  return new Proxy(target, handler) as Store<any>
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

export const override = (
  target: Record<string, unknown>,
  payload: Record<string, unknown>
) => {
  // delete all keys
  Object.keys(target).forEach((key) => delete target[key])
  // shallowmerge it to the object
  Object.keys(payload).forEach((key) => (target[key] = payload[key]))
  // if array, also modify {.length} correctly
  if (Array.isArray(target)) (target as any).length = payload.length
}
