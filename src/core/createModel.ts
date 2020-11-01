import { createStore } from './createStore'
import { Actor, Store, GetStoreActions } from './types'
import { isStore, storeMap } from './utils'
import { set } from './main'
import { error } from './error'
// PROGRESS: disable objects as the actor
// TODO: find a new name for actor
// TODO: make different types for models and stores
// IMPORTANT: fix types for model vs store types

type Model<T, A> = Store<T, GetStoreActions<T, A>>

type ArrayBuiltins<K> = {
  add: (item: K) => void
  remove: (match: number | ((item: K) => boolean)) => void
}

type ObjectBuiltins<K> = {
  add: (item: K, key: string) => void
  remove: (key: string) => void
}

enum Types {
  array,
  object,
}

type ModelCreator = <T, A extends Actor<T, any>, K>(
  init: (payload: K) => T,
  actor?: A
) => {
  // create function
  (arg: K): Model<T, A>

  // array
  array<L extends Record<number, K | T> | K[] | T[], B>(
    init: L,
    actor: (store: Store<L, ArrayBuiltins<K>>) => B
  ): Store<Model<T, A>[], B>
  array<L extends Record<number, K | T> | K[] | T[]>(
    init?: L
  ): Store<Model<T, A>[], ArrayBuiltins<K>>

  // object
  object<L extends Record<string, K | T>, B extends Actor<L, any>>(
    init?: L,
    actor?: B
  ): Store<
    Record<string, Model<T, A>>,
    B extends undefined ? ObjectBuiltins<K> : GetStoreActions<L, B>
  >
}

export const createModel: ModelCreator = (init, actor) => {
  const storeCreator = (a: any) => {
    const value = init(a)
    const store = createStore(value, actor)
    // modify the set function of the store
    const { internal } = storeMap.get(store) as any
    const oldSet = internal.set
    // override the set function with its special version
    internal.set = (value: any) => {
      // modify the candidate before it goes into traversal
      value = init(value)
      oldSet(value)
    }
    // override
    return store
  }
  Object.assign(storeCreator, {
    array: recordCreator(storeCreator, Types.array),
    object: recordCreator(storeCreator, Types.object),
  })
  return storeCreator as any
}

const recordCreator = (storeCreator: any, type?: Types) => <T, A>(
  init: T,
  actor?: A
) => {
  if (init && typeof init !== 'object') {
    type === Types.array ? error('array-creator') : error('object-creator')
  }

  const value = ensureStores(init, storeCreator, type)
  const builtins =
    type === Types.array
      ? (store: any) => ({
          add: (item: any) => set(store, (state) => [...state, item]),
          remove: (match: any) => {
            set(store, (state) => {
              if (typeof match === 'number') {
                return state.filter(
                  (item: any, index: number) => index !== match
                )
              } else {
                return state.filter((item: any) => !match(item))
              }
            })
          },
        })
      : (store: any) => ({
          add: (item: any, key: string) =>
            set(store, (state) => ({ ...state, [key]: item })),
          remove: (match: any) => {
            set(store, (state) => {
              return Object.keys(state).reduce((result, key) => {
                if (key !== match) {
                  result[key] = state[key]
                }
                return result
              }, {} as any)
            })
          },
        })

  const store = createStore(value)
  // modify the set function of the store
  const { internal } = storeMap.get(store) as any
  internal.setAsRecord()
  internal.setActions(builtins)
  internal.setActions(actor)

  const oldSet = internal.set
  // override the set function with its special version
  internal.set = (value: any) => {
    // modify the candidate before it goes into traversal
    value = ensureStores(value, storeCreator, type)
    oldSet(value)
  }

  return store
}

const ensureStores = (obj: any, storeCreator: any, type?: Types) => {
  if (obj === undefined || obj === null) {
    if (type === Types.array) {
      return []
    } else if (type === Types.object) {
      return {}
    } else {
      return obj
    }
  }
  Object.keys(obj).forEach((key) => {
    if (!isStore(obj[key])) {
      obj[key] = storeCreator(obj[key])
    }
  })
  return obj
}
