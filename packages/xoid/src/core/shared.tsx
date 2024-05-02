export const IDENTITY = <T,>(value: T) => value

// Used by the reactive and tracking APIs, as well as the `.focus` method.
export const INTERNAL = Symbol()

export const SHARED = {
  // Used by `computed` to collect `.value` destructures implicitly
  get: IDENTITY,
  // Used by `effect` and `subscribe` function to collect effects implicitly
  add: IDENTITY,
  // Used by `@xoid/devtools` to listen to actions
  wrap: IDENTITY as any,
  send: IDENTITY,
} as {
  get: typeof IDENTITY
  add: typeof IDENTITY
  wrap: <T>(value: T, _atom: any) => T
  send: typeof IDENTITY
  ctx: WeakMap<any, any>
}
