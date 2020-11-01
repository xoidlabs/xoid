import { Store, GetStoreState, Useable } from './types'
import { memberMap, parentMap, storeMap } from './utils'

export const get = <T extends Useable<any>>(item: T): GetStoreState<T> => {
  const record = storeMap.get(item) || memberMap.get(item)
  if (record) {
    const { address, internal } = record
    if (address.length) {
      return address.reduce(
        (acc: any, key: any) => acc[key],
        internal.getState()
      )
    } else {
      return internal.getState()
    }
  } else throw TypeError('TODO: cannot get non-observable value')
}

export const set = <T extends Useable<any>>(
  store: T,
  fn: GetStoreState<T> | ((state: GetStoreState<T>) => GetStoreState<T>)
): void => {
  const record = storeMap.get(store) || memberMap.get(store)
  if (record) {
    const { value, address, internal } = record
    const newValue = typeof fn === 'function' ? (fn as Function)(value) : fn
    if (newValue !== value) {
      if (address.length) {
        const newState = { ...internal.get() }
        address.reduce((acc0: any, key, i) => {
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

export const subscribe = <T extends Useable<any>>(
  item: T,
  fn: (state: GetStoreState<T>) => void
) => {
  const record = storeMap.get(item) || memberMap.get(item)
  if (record) {
    const { address, internal } = record
    if (address.length) {
      return internal.subscribe(fn as any, (state: any) =>
        address.reduce((acc: any, key: string) => acc[key], state)
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
