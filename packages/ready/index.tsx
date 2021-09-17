import { MutableStore, Store } from '@xoid/core'
import { createInstance } from '@xoid/core/src/utils'
import { IsObservable, META, effect } from '@xoid/engine'

export type ReadyStore<T> = ReadyObservable<T> &
  (T extends object ? { [K in keyof T]: ReadyStore<T[K]> } : {})
export type ReadyObservable<T> = {
  (): T | undefined
  (state: T): void
  (fn: (state: T) => T): void
} & IsObservable

export function ready<T extends any>(store: MutableStore<T | undefined>): ReadyStore<T>
export function ready<T extends any>(store: Store<T | undefined>): ReadyStore<T>
export function ready(store: any): any {
  const customTarget = (address = []) => {
    let sourceStore: Store<any> | undefined
    let hasLastValue = false
    let lastValue: any
    const onSet = (_meta: any, value: any) => {
      if (sourceStore) {
        lastValue = undefined
        hasLastValue = false
        return sourceStore(value)
      }
      lastValue = value
      hasLastValue = true
    }
    const targetStore = createInstance({ onSet })(undefined, true)
    const meta = targetStore[META]
    const setTargetStore = (state: any) => {
      if (meta.node === state) return
      meta.node = state
      meta.root.notify()
    }
    effect(store, () => {
      const state = store()
      if (!state) return
      sourceStore = address.reduce((acc, prop) => acc[prop], store) as Store<any>
      // if it suddenly appears, and it has a last value to set
      if (hasLastValue) return onSet(meta, lastValue)
      if (targetStore) setTargetStore(sourceStore())
    })
    return targetStore
  }
  return addressProxy(customTarget, [])
}

function addressProxy(fn: any, address: any): any {
  return new Proxy(fn(address), {
    get: (target, prop) => {
      if (prop === META) return target[META]
      return addressProxy(fn, [...address, prop])
    },
  })
}
