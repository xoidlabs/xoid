export type Atom<T> = {
  /**
   * The current value of the atom.
   */
  value: T
  /**
   * Sets the value of the atom.
   */
  set(state: T): void
  /**
   * Updates the value of the atom using a updater function.
   */
  update(fn: (state: T) => T): void
  /**
   * Subscribes to the atom WITHOUT calling with the current value at the start.
   */
  subscribe(fn: (state: T, prevState: T) => void | Destructor): () => void
  /**
   * Subscribes to the atom. It calls the callback with the current value once at the start.
   */
  watch(fn: (state: T, prevState: T) => void | Destructor): () => void
  /**
   * Focuses on a part of the atom's state.
   */
  focus<U>(fn: (state: T) => U): Atom<U>
  focus<U extends keyof T>(key: U): Atom<T[U]>
  /**
   * Creates a derived atom from the current atom.
   */
  map<U>(fn: (state: T, prevState: T) => U): Atom<U>
  map<U>(fn: (state: T, prevState: T) => U, filterOutFalsyValues: true): Stream<Truthy<U>>
}

export type Stream<T> = {
  /**
   * The current value of the stream.
   */
  value: T | undefined
  /**
   * Sets the value of the stream.
   */
  set(state: T): void
  /**
   * Updates the value of the stream using a updater function.
   */
  update(fn: (state: T | undefined) => T): void
  /**
   * Subscribes to the stream WITHOUT calling with the current value at the start.
   */
  subscribe(fn: (state: T, prevState: T | undefined) => void | Destructor): () => void
  /**
   * Subscribes to the atom WITHOUT calling with the current value at the start.
   */
  watch(fn: (state: T | undefined, prevState: T | undefined) => void | Destructor): () => void
  /**
   * Subscribes to the atom. It calls the callback with the current value once at the start.
   */
  focus<U>(fn: (state: T) => U): Stream<U>
  focus<U extends keyof T>(key: U): Stream<T[U]>
  /**
   * Creates a derived stream from the current stream.
   */
  map<U>(fn: (state: T, prevState: T | undefined) => U): Stream<U>
  map<U>(
    fn: (state: T, prevState: T | undefined) => U,
    filterOutFalsyValues: true
  ): Stream<Truthy<U>>
}

/**
 * The `get` function passed to computed atoms.
 */
export type GetState = {
  <T>(atom: Atom<T>): T
  <T>(getState: () => T, subscribe: (fn: () => void) => () => void): T
}

/**
 * Initial value or evaluation function for an atom.
 */
export type Init<T> = T | ((get: GetState) => T)

/**
 * Attached actions for an atom.
 */
export type Actions<U> = { actions: U; debugValue?: string }

export type Truthy<T> = Exclude<T, false | 0 | '' | null | undefined>

declare const voidOnly: unique symbol
export type Destructor = () => void | { [voidOnly]: never }
