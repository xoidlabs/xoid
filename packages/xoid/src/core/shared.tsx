export const IDENTITY = <T,>(value: T, ...args: any) => value

// Used by `toReactive` to access the internal atom
export const INTERNAL = Symbol()

// Used by @xoid/devtools
export const SHARED = {
  // Used by `computed` to collect `.value` destructures implicitly
  get: IDENTITY,
  // Used by `effect` and `subscribe` function to collect effects implicitly
  add: IDENTITY,
  // Used by `@xoid/devtools` to listen to actions
  wrap: IDENTITY,
} as {
  get: typeof IDENTITY
  add: typeof IDENTITY
  wrap: typeof IDENTITY
  ctx: WeakMap<any, any>
}
