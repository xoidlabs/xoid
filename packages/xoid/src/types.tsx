/**
 * @see [xoid.dev/docs/api/atom](https://xoid.dev/docs/api/atom)
 */
export type Atom<T> = {
  value: T
  set(state: T): void
  update(fn: (state: T) => T): void
  subscribe(fn: (state: T, prevState: T) => unknown): () => void
  watch(fn: (state: T, prevState: T) => unknown): () => void

  focus<U>(fn: (state: T) => U): Atom<U>
  focus<U extends keyof T>(key: U): Atom<T[U]>
  pass<U>(fn: (state: T) => U): Atom<U>
  pass<U>(fn: (state: T) => U, passOnlyTruthyValues: true): Stream<Exclude<U, null | undefined>>
}

export type Stream<T> = {
  value: T | undefined
  set(state: T): void
  update(fn: (state: T | undefined) => T): void
  subscribe(fn: (state: T, prevState: T | undefined) => unknown): () => void
  watch(fn: (state: T | undefined, prevState: T | undefined) => unknown): () => void

  focus<U>(fn: (state: T) => U): Stream<U>
  focus<U extends keyof T>(key: U): Stream<T[U]>
  pass<U>(fn: (state: T) => U): Stream<U>
  pass<U>(fn: (state: T) => U, passOnlyTruthyValues: true): Stream<Exclude<U, null | undefined>>
}

declare const usable: unique symbol
export type Usable<U> = { [usable]: U; debugValue?: string }

export type GetState = {
  <T>(atom: Atom<T>): T
  <T, U extends keyof T>(atom: Atom<T>, key: U): T[U]
  <T>(getState: () => T, subscribe: (fn: () => void) => () => void): T
}

export type Init<T> = T | ((get: GetState) => T)

export type Value<T extends Atom<any>> = T['value']

export type SetState<T extends Atom<any>> = T['set']

export type UpdateState<T extends Atom<any>> = T['update']
