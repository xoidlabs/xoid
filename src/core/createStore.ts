import {
  Destroy,
  GetMutableCopy,
  GetState,
  SetState,
  Subscribe,
  ShallowSubscribe,
  State,
  Initializer,
  Settings,
  baseStore,
} from './baseStore'

import {
  Actor,
  ActorCallback,
  ActorObject,
  Store,
  TransformToActions,
} from './types'
import { storeMap } from './utils'

export type GetActions<A> = () => A

export interface StoreAPI<T extends State> {
  get: GetState<T>
  set: SetState<T>
  subscribe: Subscribe<T>
  shallowSubscribe: ShallowSubscribe<T>
  destroy: Destroy
}

export interface StoreInternalAPI<T extends State> extends StoreAPI<T> {
  getMutableCopy: GetMutableCopy<T>
  getActions: GetActions<any>
  forceUpdate: () => void
}

/**
 * Creates a store with the first argument as the initial value. Optionally,
 * store actions can be specified in the second argument. If a function
 * is used as the first argument, a derived state can be created.
 *
 * [API](https://xoid.dev/docs/api/create-store/)
 */
export function createStore<T, A extends Actor<T, any>>(
  init: T | Initializer<T>,
  actor?: A,
  settings?: Settings
): Store<T, TransformToActions<T, A>>

export function createStore<T>(
  init: T | Initializer<T>,
  actor?: undefined,
  settings?: Settings
): Store<T, {}>

export function createStore<T, A extends Actor<T, any>>(
  init: T | Initializer<T>,
  actor?: A,
  settings?: Settings
) {
  let actions: any = {}
  const getActions: GetActions<A> = () => actions
  const store = baseStore(init, settings)
  Object.assign(store, { getActions })
  const mutableCopy = store.getMutableCopy()
  storeMap.set(mutableCopy, {
    internal: store,
    address: [],
    get value() {
      return store.get()
    },
  })

  if (actor) {
    if (typeof actor === 'function') {
      actions = (actor as ActorCallback<T, any>)(mutableCopy)
    } else if (typeof actor === 'object') {
      actions = Object.keys(actor).reduce((acc, key) => {
        acc[key] = (actor as ActorObject<T, any>)[key](mutableCopy) // todo: add current actions as second arg
        return acc
      }, {} as any)
    } else {
      throw TypeError(
        'TODO: an actor must be a function, object of functions, array of functions'
      )
    }
    // TODO: make this part of the config
    // @ts-ignore
    mutableCopy['🔑'] = actions
  }

  return mutableCopy
}
