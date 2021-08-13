export type Listener<T> = (state: T) => void
export type State<T extends Store<any>> = T extends Store<infer P> ? P : never
export type GetState = <T>(store: Store<T>) => T
export type SetState<T> = (state: T | ((state: T) => T)) => void

export type Store<T> = {
  (): T
  (state: T | ((state: T) => T)): void
} & (T extends object ? { [K in keyof T]: Store<T[K]> } : {})

export type Create = <T extends any>(
  init: T | ((get: GetState) => T),
  mutable?: boolean
) => Store<T>
