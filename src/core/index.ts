import { Root } from './root'
import { error } from './errors'
import { getData, isRootData, transform } from './utils'
import { Initializer, After, Store, Value, Pure } from './types'

export { objectOf, arrayOf } from './model'
export type { Store, Value, Pure } from './types'

/**
 * Creates a store with the first argument as the initial state.
 * Store actions can be specified in the return value of the second argument.
 * @see [xoid.dev/docs/api/create](https://xoid.dev/docs/api/create)
 */

export function create<T, Actions = undefined>(
  init: T | Initializer<T>,
  after?: After<T, Actions>
): Store<T, Actions> {
  const root = new Root(init, after)
  return root.getStore()
}

/**
 * Gets the value of a store, or a store member.
 * @see [xoid.dev/docs/api/get](https://xoid.dev/docs/api/get)
 */

export const get = <T>(item: Value<T>): Pure<T> => {
  const data = getData(item)
  if (data) return transform(data, true) as any
  else throw error('get')
}

/**
 * Sets the value of a store, or a store member.
 * @see [xoid.dev/docs/api/set](https://xoid.dev/docs/api/set)
 */

export const set = <T extends Value<any>>(
  item: T,
  value: Pure<T> | ((state: Pure<T>) => Pure<T>)
): void => {
  const data = getData(item)
  if (!data) throw error('set')
  const { root, source, key } = data
  const prevValue = transform(data, true)
  if (typeof value === 'function') {
    const nextValue =
      typeof value === 'function'
        ? (value as (state: T) => T)(prevValue)
        : value
    root.handleStateChange(source, key, nextValue as T)
  } else {
    root.handleStateChange(source, key, value)
  }
}

/**
 * Gets actions of a store.
 * Actions are defined at the second argument of `create` method.
 * @see [xoid.dev/docs/api/use](https://xoid.dev/docs/api/use)
 */

export const use = <T, Actions>(item: Store<T, Actions>): Actions => {
  const data = getData(item)
  if (isRootData(data)) return data.root.getActions()
  else throw error('use')
}

/**
 * Subscribes to a store, or a store member.
 * @see [xoid.dev/docs/api/subscribe](https://xoid.dev/docs/api/subscribe)
 */

export const subscribe = <T>(item: Value<T>, fn: (state: Pure<T>) => void) => {
  const data = getData(item)
  let previousValue = get(item)
  const unsubs = new Set<() => void>()

  const intercept = () =>
    transform(data, true, (subItem: any) => {
      const subData = getData(subItem)
      unsubs.add(subData.root.subscribe(forceUpdate))
    })

  const forceUpdate = () => {
    const value = intercept()
    if (previousValue !== value) fn(value)
    previousValue = value
  }

  unsubs.add(data.root.subscribe(forceUpdate))

  return () => unsubs.forEach((unsub) => unsub())
}

/**
 * Converts reactive store into a JS object by generating a deepcopy.
 * Useful for JSON serialization and debugging.
 * @see [xoid.dev/docs/api/current](https://xoid.dev/docs/api/current)
 */

export const current = <T>(item: Value<T>): Pure<T> => {
  const inner = (obj: any) => {
    if (typeof obj === 'object') {
      const newNode = new (obj as any).constructor()
      Object.keys(obj).forEach((key) => {
        newNode[key] = inner((obj as any)[key])
      })
      return newNode
    } else {
      return obj
    }
  }
  return inner(get(item))
}
