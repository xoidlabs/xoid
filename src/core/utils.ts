import { useEffect, useLayoutEffect } from 'react'
import { configObject } from './config'
import { StoreInternalAPI } from './createStore'
import { error } from './error'
import { Store, Useable } from './types'

// For SSR / React Native: https://github.com/react-spring/zustand/pull/34
export const useIsoLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect

export const isStore = (store: Useable<any>): store is Store<any, any> =>
  storeMap.has(store)

// Following answer is used as a starting point
// https://stackoverflow.com/questions/4459928/how-to-deep-clone-in-javascript/40294058#40294058
// answered Oct 27 '16 at 20:56 by trincot
export const deepClone = (
  state: any,
  store: StoreInternalAPI<any>,
  relativeAddress: string[] = []
): any => {
  const childStores = new Set()
  const deepCloneInner = (
    obj: any,
    hash = new WeakMap(),
    address: string[] = relativeAddress
  ): any => {
    if (Object(obj) !== obj) {
      const primitive = { [configObject.valueSymbol]: obj } as Useable<any>
      // record the address  and store of the primitive. (for being able to subscribe and set)
      memberMap.set(primitive, { internal: store, address, value: obj })
      return [primitive, obj]
    }
    if (hash.has(obj)) return [...hash.get(obj)] // cyclic reference
    const attemptChildStore = storeMap.get(obj)

    if (attemptChildStore) {
      childStores.add(attemptChildStore)
      const mc = attemptChildStore.internal.getMutableCopy()
      parentMap.set(mc, { parent: store.getMutableCopy(), address })
      return [mc, attemptChildStore.internal.getState()]
    }
    const isArray = Array.isArray(obj)
    const isFunction = typeof obj === 'function'

    const result = isArray
      ? []
      : isFunction
      ? obj
      : obj.constructor
      ? new obj.constructor()
      : Object.create(null)

    const result2 = isArray
      ? []
      : isFunction
      ? obj
      : obj.constructor
      ? new obj.constructor()
      : Object.create(null)

    // record the address and store of the object. (for being able to subscribe and set)
    memberMap.set(result, { internal: store, address, value: obj })
    hash.set(obj, [result, result2])

    Object.keys(obj).map((key) => {
      address = [] // TODO: add more extensive tests to this
      address.push(key)
      const cloneResult = deepCloneInner(obj[key], hash, address)
      result[key] = cloneResult[0]
      result2[key] = cloneResult[1]
    })

    return [result, result2]
  }

  if (isStore(state)) {
    // IMPORTANT: following parts could be changed based on the config
    const child = storeMap.get(state)
    childStores.add(child)
    // @ts-ignore
    const [result, result2] = [state, child.internal.getState()]
    return [result, result2, childStores]
  } else {
    const [result, result2] = deepCloneInner(state)
    return [result, result2, childStores]
  }
}

export const destroy = <T extends Useable<any>>(item: T) => {
  const record = storeMap.get(item)
  if (record) return record.internal.destroy()
  else error('destroy')
}

// TODO: May need to convert some Sets into WeakSets as well

// This map is used by {get, subscribe} exports, to know the store that
// the member (object or primitive) belongs to, and its address in that store
export const memberMap = new WeakMap<
  Useable<any>,
  { internal: StoreInternalAPI<any>; address: string[]; value: any }
>()

export const storeMap = new WeakMap<
  Useable<any>,
  { internal: StoreInternalAPI<any>; address: string[]; value: any }
>()

export const parentMap = new WeakMap()
