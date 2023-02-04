export type Atom<T> = {
  value: T
  set(state: T): void
  update(fn: (state: T) => T): void
  subscribe(fn: (state: T, prevState: T) => unknown): () => void
  watch(fn: (state: T, prevState: T) => unknown): () => void
  focus<U>(fn: (state: T) => U): Atom<U>
  focus<U extends keyof T>(key: U): Atom<T[U]>
  map<U>(fn: (state: T, prevState: T) => U): Atom<U>
  map<U>(fn: (state: T, prevState: T) => U, filterOutFalsyValues: true): Stream<Truthy<U>>
}
export type Stream<T> = {
  value: T | undefined
  set(state: T): void
  update(fn: (state: T | undefined) => T): void
  subscribe(fn: (state: T, prevState: T | undefined) => unknown): () => void
  watch(fn: (state: T | undefined, prevState: T | undefined) => unknown): () => void
  focus<U>(fn: (state: T) => U): Stream<U>
  focus<U extends keyof T>(key: U): Stream<T[U]>
  map<U>(fn: (state: T, prevState: T | undefined) => U): Stream<U>
  map<U>(
    fn: (state: T, prevState: T | undefined) => U,
    filterOutFalsyValues: true
  ): Stream<Truthy<U>>
}

export type Actions<U> = { actions: U; debugValue?: string }

export type GetState = {
  <T>(atom: Atom<T>): T
  <T>(getState: () => T, subscribe: (fn: () => void) => () => void): T
}

export type Init<T> = T | ((get: GetState) => T)

export type Value<T extends Atom<any>> = T['value']

export type SetState<T extends Atom<any>> = T['set']

export type UpdateState<T extends Atom<any>> = T['update']

export type Truthy<T> = Exclude<T, false | 0 | '' | null | undefined>
