import { createStore } from './createStore'
import { Actor, Store, TransformToActions } from './types'
import { isStore, storeMap } from './utils'

type Model<T, A> = Store<T, TransformToActions<T, A>>

type ModelCreator = <T, A extends Actor<T, any>, K>(
  init: (payload: K) => T,
  actor?: A
) => {
  (arg: K): Model<T, A>
  record<A>(
    init: Record<number | string, K | T> | K[] | T[],
    actor?: A
  ): Store<Record<number | string, T>, A>
  array<A>(
    init: Record<number, K | T> | K[] | T[],
    actor?: A
  ): Store<Record<number, T>, A>
  object<A>(init: Record<string, K | T>, actor?: A): Store<Record<string, T>, A>
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
      value = init(value)
      oldSet(value)
    }
    return store
  }
  Object.assign(storeCreator, {
    record: recordCreator(storeCreator),
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
  const store = createStore(value, actor as any)

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
