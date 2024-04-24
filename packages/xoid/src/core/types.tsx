export type StandardConfig<T> = {
  get: () => T
  subscribe(fn: () => void): () => void
  set?: (state: T) => void
}

export type EnhancedConfig<T> = {
  set: (state: T) => void
}

export type LazyConfig<T> = {
  subscribe(fn: (state: T) => void): () => void
  set?: (state: T) => void
}

export type ConfigObject<T> = StandardConfig<T> | LazyConfig<T> | EnhancedConfig<T> | {}

export type Config<T> = ConfigObject<T> | LazyConfig<T>['subscribe']

export type Store<T> = {
  listeners: Set<() => void>
  isStream?: boolean
  $isDirty?: Store<boolean>
  get: () => T
  set: (state: T) => void
  subscribe(fn: (state: T) => void): () => void
}

export type LazyStore<T> = {
  listeners: Set<() => void>
  get: () => T | undefined
  set: (state: T) => void
  subscribe(fn: (state: T) => void): () => void
}

export type GetState = <T>(ref: StandardConfig<T>) => T
