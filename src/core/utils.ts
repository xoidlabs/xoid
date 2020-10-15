import { useEffect, useLayoutEffect } from 'react'
import { StoreInternalAPI } from './createStore'
import { List } from './types'

// For SSR / React Native: https://github.com/react-spring/zustand/pull/34
export const useIsoLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect

export const isStore = (store: unknown): store is StoreInternalAPI<unknown> => {
  return storeMap.has(store)
}

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
      const primitive = { '🔥': obj }
      // record the address  and store of the primitive. (for being able to subscribe and set)
      memberMap.set(primitive, { internal: store, address, value: obj })
      return primitive
    }
    if (hash.has(obj)) return hash.get(obj) // cyclic reference
    const st = storeMap.get(obj)
    if (st) {
      childStores.add(st)
      return st.internal.getMutableCopy()
    }
    const isArray = Array.isArray(obj)
    const result = isArray
      ? []
      : obj.constructor
      ? new obj.constructor()
      : Object.create(null)

    // record the address and store of the object. (for being able to subscribe and set)
    memberMap.set(result, { internal: store, address, value: obj })
    hash.set(obj, result)

    return Object.assign(
      result,
      ...Object.keys(obj).map((key) => {
        address.push(key)
        const val: any = { [key]: deepCloneInner(obj[key], hash, address) }
        address = relativeAddress
        return val
      })
    )
  }
  const result = deepCloneInner(state)
  return [result, childStores]
}

// TODO: If it's completely OK, turn these into WeakMaps.
// May need to convert some Sets into WeakSets as well

// This map is used by {get, subscribe} exports, to know the store that
// the member (object or primitive) belongs to, and its address in that store
export const memberMap = new Map<
  List<any>,
  { internal: StoreInternalAPI<any>; address: string[]; value: any }
>()

// This is used by {isStore}
export const storeMap = new Map()
