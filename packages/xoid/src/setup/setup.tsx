import { scope } from './scope'
import { EffectController, effect } from './effect'

export function setup<T>(this: symbol | void, fn: () => T): [T, EffectController] {
  let value: T
  const controller = effect(() => {
    value = scope.call(this, fn)
  })()
  // @ts-expect-error: TS is warning us that the effect's callback might not run synchronously,
  // but it does actually.
  return [value, controller]
}
