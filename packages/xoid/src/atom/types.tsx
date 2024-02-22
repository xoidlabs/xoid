import { GetState } from '../core/types'
import { Destructor, Truthy } from '../utils/types'

export type Init<T> = T | ((get: GetState) => T)

export type Atom<T> = {
  value: T
  get(): T
  set(state: T): void
  update(fn: (state: T) => T): void
  subscribe(fn: (state: T, prevState: T) => void | Destructor): () => void
  watch(fn: (state: T, prevState: T) => void | Destructor): () => void
  focus<U>(fn: (state: T) => U): Atom<U>
  focus<U extends keyof T>(key: U): Atom<T[U]>
  map<U>(fn: (state: T) => U): Atom<U>
  map<U>(fn: (state: T) => U, filterOutFalsyValues: true): Stream<Truthy<U>>
}

export type Stream<T> = {
  value: T | undefined
  get(): T
  set(state: T): void
  update(fn: (state: T | undefined) => T): void
  subscribe(fn: (state: T, prevState: T | undefined) => void | Destructor): () => void
  watch(fn: (state: T | undefined, prevState: T | undefined) => void | Destructor): () => void
  focus<U>(fn: (state: T) => U): Stream<U>
  focus<U extends keyof T>(key: U): Stream<T[U]>
  map<U>(fn: (state: T) => U): Stream<U>
  map<U>(fn: (state: T) => U, filterOutFalsyValues: true): Stream<Truthy<U>>
}

export type Actions<T> = { actions: T; debugValue?: string }
