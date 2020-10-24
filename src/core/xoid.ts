import { List, Store, ReverseTransform, Actor } from './types'
import { deepClone, memberMap, parentMap, storeMap } from './utils'

export const get = <T extends object>(item: T): ReverseTransform<T> => {
  const record = storeMap.get(item) || memberMap.get(item)
  if (record) return record.value
  else throw TypeError('TODO: cannot get non-observable value')
}

export const set = <T extends object>(
  item: T,
  fn:
    | ReverseTransform<T>
    | ((state: ReverseTransform<T>) => ReverseTransform<T>)
): void => {
  const record = storeMap.get(item) || memberMap.get(item)
  if (record) {
    const { value, address, internal } = record
    const newValue = typeof fn === 'function' ? (fn as Function)(value) : fn
    if (newValue !== value) {
      if (address.length) {
        const newState = { ...internal.get() }
        address.reduce((acc0: any, key: any, i: number) => {
          if (i === address.length - 1) acc0[key] = newValue
          return acc0[key]
        }, newState)
        internal.set(newState)
      } else {
        internal.set(newValue)
      }
    }
  } else throw TypeError('TODO: cannot get non-observable value')
}

export const use = <T, A>(item: Store<T, A>): A => {
  const record = storeMap.get(item)
  if (record) return record.internal.getActions()
  else throw TypeError('TODO: cannot use non-store')
}

export const destroy = <T extends Store<any, any>>(item: T) => {
  const record = storeMap.get(item as object)
  if (record) return record.internal.destroy()
  else throw TypeError('TODO: cannot destroy non-store')
}

export const subscribe = <T extends Store<any, any>>(
  item: T,
  fn: (state: ReverseTransform<T>) => void
) => {
  const record = storeMap.get(item as object) || memberMap.get(item)
  if (record) {
    const { address, internal } = record
    if (address.length) {
      return internal.subscribe(fn as any, (state: any) =>
        address.reduce((acc: any, key: any) => {
          return acc[key]
        }, state)
      )
    } else {
      return internal.subscribe(fn as any)
    }
  } else {
    throw TypeError('TODO: cannot subscribe non-observable')
  }
}

export const parent = <T extends Store<any>>(item: T): Store<any> => {
  const record = parentMap.get(item as object)
  if (record) return record.parent
}
