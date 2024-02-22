import { scope } from './scope'
import { effect } from './effect'

export function setup<T>(this: symbol | void, fn: () => T): [T, () => () => void] {
  let value: T
  const subscribe = effect(() => {
    value = scope.call(this, fn)
  })()
  return [value, subscribe]
}
