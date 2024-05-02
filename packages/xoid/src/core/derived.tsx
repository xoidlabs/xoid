import { store, type Store } from './store'

export function derived<T, U>(parentStore: Store<T>, selector: (state: T) => U) {
  const baseStore = store.call({
    get: () => selector(parentStore.get()),
    subscribe: (fn) => parentStore.subscribe(fn),
  })
  return baseStore
}

export function derived2<T, U>(source: Store<T>, selector: (state: T) => U) {
  // We create a store and swap its `.get` method with some evaluation-when-needed logic
  const target = store.call(() => source.subscribe(evaluate))
  const { get } = target
  target.get = () => (evaluate(), get())
  const evaluate = () => {
    // Only evaluate when we have different versions
    if (source.version !== target.version) {
      target.version = source.version
      target.set(selector(source.get()))
    }
  }
  return target
}

export const createStream = <T, U>(source: Store<T>, selector: (state: T) => U) => {
  // If we have subscribers, immediately evaluate
  const target = store.call(() => source.subscribe(evaluate))
  const { get } = target

  let isDirty = true
  const evaluate = () => {
    isDirty = false
    target.set(selector(source.get()))
  }

  // Running .get sets isDirty to false, how do we know when to compute it again?
  target.get = () => {
    if (isDirty) evaluate()
    return get()
  }

  return target
}
