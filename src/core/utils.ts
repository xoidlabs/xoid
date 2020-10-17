import { useEffect, useLayoutEffect } from 'react'
import { configObject } from './config'
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
      const primitive = { [configObject.valueSymbol]: obj }
      // record the address  and store of the primitive. (for being able to subscribe and set)
      memberMap.set(primitive, { internal: store, address, value: obj })
      return [primitive, obj]
    }
    if (hash.has(obj)) return [...hash.get(obj)] // cyclic reference
    const st = storeMap.get(obj)
    if (st) {
      childStores.add(st)
      const mc = st.internal.getMutableCopy()
      parentMap.set(mc, st)
      return [mc, st.internal.get2()]
    }
    const isArray = Array.isArray(obj)
    const result = isArray
      ? []
      : obj.constructor
      ? new obj.constructor()
      : Object.create(null)

    const result2 = isArray
      ? []
      : obj.constructor
      ? new obj.constructor()
      : Object.create(null)

    // record the address and store of the object. (for being able to subscribe and set)
    memberMap.set(result, { internal: store, address, value: obj })
    hash.set(obj, [result, result2])

    Object.keys(obj).map((key) => {
      address.push(key)
      const cloneResult = deepCloneInner(obj[key], hash, address)
      result[key] = cloneResult[0]
      result2[key] = cloneResult[1]
      address = relativeAddress
    })

    return [result, result2]
  }
  const [result, result2] = deepCloneInner(state)
  return [result, result2, childStores]
}

// TODO: If it's completely OK, turn these into WeakMaps.
// May need to convert some Sets into WeakSets as well

// This map is used by {get, subscribe} exports, to know the store that
// the member (object or primitive) belongs to, and its address in that store
export const memberMap = new Map<
  List<any>,
  { internal: StoreInternalAPI<any>; address: string[]; value: any }
>()

export const storeMap = new Map()

export const parentMap = new Map()
