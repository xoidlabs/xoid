import { createStore } from './createStore'
import { Actor, Store, TransformToActions } from './types'
import { isStore, storeMap } from './utils'
import { set } from './xoid'

type Model<T, A> = Store<T, TransformToActions<T, A>>

type ModelCreator = <T, A extends Actor<T, any>, K>(
  init: (payload: K) => T,
  actor?: A
) => {
  (arg: K): Model<T, A>
  array<B>(
    init?: Record<number, K | T> | K[] | T[],
    actor?: B
  ): Store<
    Store<T, TransformToActions<T, A>>[],
    {
      add: (item: K) => void
      remove: (match: number | ((item: K) => boolean)) => void
    }
  >
  object<B>(
    init?: Record<string, K | T>,
    actor?: B
  ): Store<
    Record<string, Store<T, TransformToActions<T, A>>>,
    {
      add: (item: K, key: string) => void
      remove: (key: string) => void
    }
  >
}

enum Types {
  array,
  object,
}

export const createModel: ModelCreator = (init, actor) => {
  const storeCreator = (a: any) => {
    const value = init(a)
    const store = createStore(value, actor)
    // modify the set function of the store
    const { internal } = storeMap.get(store)
    const oldSet = internal.set
    // override the set function with its special version
    internal.set = (value: any) => {
      // modify the candidate before it goes into traversal
      value = init(value)
      oldSet(value)
    }
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
    throw TypeError('TODO: A record must be of object type')
  }
  const value = ensureStores(init, storeCreator, type)

  const defaults =
    type === Types.array
      ? {
          add: (store: any) => (item: any) =>
            set(store, (state) => [...state, item]),
          remove: (store: any) => (match: any) => {
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
        }
      : {
          add: (store: any) => (item: any, key: string) =>
            set(store, (state) => ({ ...state, [key]: item })),
          remove: (store: any) => (match: any) => {
            set(store, (state) => {
              return Object.keys(state).reduce((result, key) => {
                if (key !== match) {
                  result[key] = state[key]
                }
                return result
              }, {} as any)
            })
          },
        }

  let a: any
  if (actor && typeof actor === 'function') {
    a = actor
  } else {
    a = Object.assign(defaults, actor) // TODO: fix types for this
  }
  const store = createStore(value, a)

  // modify the set function of the store
  const { internal } = storeMap.get(store)
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
