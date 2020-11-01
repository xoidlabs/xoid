import {
  Destroy,
  GetSymbolicState,
  GetState,
  SetState,
  Subscribe,
  ShallowSubscribe,
  Settings,
  baseStore,
  StateGetter,
  StateSetter,
} from './baseStore'
import { configObject } from './config'
import { error } from './error'

import {
  Actor,
  ActorCallback,
  ActorObject,
  Store,
  GetStoreActions,
} from './types'
import { storeMap } from './utils'

export type GetActions<A> = () => A

export interface StoreInternalAPI<T> {
  getMutableCopy: GetSymbolicState<T>
  getActions: GetActions<any>
  get: GetState<T>
  getState: GetState<T>
  set: SetState<T>
  subscribe: Subscribe<T>
  shallowSubscribe: ShallowSubscribe<T>
  destroy: Destroy
  setAsRecord: any
}

/**
 * Creates a store with the first argument as the initial value. Optionally,
 * store actions can be specified in the second argument. If a function
 * is used as the first argument, a derived state can be created.
 *
 * [API](https://xoid.dev/docs/api/create-store/)
 */
export function createStore<T, A extends Actor<T, any>>(
  init: T | ((get: StateGetter, set: StateSetter) => T),
  actor?: A,
  settings?: Settings
): Store<T, GetStoreActions<T, A>>

export function createStore<T>(
  init: T | ((get: StateGetter, set: StateSetter) => T),
  actor?: undefined,
  settings?: Settings
): Store<T, {}>

export function createStore<T, A extends Actor<T, any>>(
  init: T | ((get: StateGetter, set: StateSetter) => T),
  actor?: A,
  settings?: Settings
) {
  let actions: any

  const store = baseStore(init, settings)

  const getActions: GetActions<A> = () => actions
  const setActions = (actor: any) => {
    if (actor) {
      if (typeof actor === 'function') {
        actions = (actor as ActorCallback<T, any>)(mutableCopy)
      } else {
        error('action-function')
      }
      // @ts-ignore
      mutableCopy[configObject.actionsSymbol] = actions
    }
  }

  Object.assign(store, { getActions, setActions })

  const mutableCopy = store.getMutableCopy()
  storeMap.set(mutableCopy, {
    internal: store as any,
    address: [],
    get value() {
      return store.getState()
    },
  })

  setActions(actor)

  return mutableCopy
}
