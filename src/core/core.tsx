import { DetransformInner, Listener, Store, Value } from './types'
import { watchHelper } from './utils'
import { createCell, CURRENT } from './createCell'

const ActionsMap = new WeakMap()

export const ref = <T extends any, A>(init: T, after?: (store: Store<T>) => A): Store<T, A> => {
  const runtime = {
    isRef: true,
    value: init,
    listeners: new Set<Listener>(),
    subscribe: (listener: Listener) => {
      runtime.listeners.add(listener)
      return () => runtime.listeners.delete(listener)
    },
    notify: () => {
      runtime.listeners.forEach((listener) => listener())
    },
  }
  const refInner: any = () => {}
  if (after) ActionsMap.set(refInner, after(refInner))
  return refInner
}

export const create = <T extends any, A>(init: T, after?: (store: Store<T>) => A): Store<T, A> => {
  const proxy = createCell(
    {
      node: { current: init },
      proxyCache: {},
    } as any,
    'current' // (CURRENT as unknown) as string
  )
  if (after) ActionsMap.set(proxy, after(proxy))
  return proxy
}

export const watch = <T extends any>(store: Value<T>, fn: (value: DetransformInner<T>) => void) => {
  const immediate = () => {
    unsubAll()
    const value = getter()
    fn(value)
  }
  const [unsubAll, getter] = watchHelper(store, immediate)
  immediate()
  return unsubAll
}

export const use = <T, A>(store: Store<T, A>): A => ActionsMap.get(store)
