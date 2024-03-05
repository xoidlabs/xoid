import { scope } from './scope'
import { effect } from './effect'

export function setup<T>(this: symbol | void, fn: () => T): [T, () => () => void] {
  let value: T
  const subscribe = effect(() => {
    value = scope.call(this, fn)
  })()
  // @ts-expect-error: TS is warning us that the effect's callback might not run synchronously,
  // but it does actually.
  return [value, subscribe]
}
