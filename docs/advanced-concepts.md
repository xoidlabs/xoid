---
id: advanced-concepts
title: Advanced concepts
---

## Deriving state from external sources

With an additional feature of `get` function, you can get the state from non-atoms. This can be a Redux store, an RxJS observable, or anything that implements getState & subscribe pair. Here is an atom that derives its state from a Redux store.

```js
import store from './reduxStore'

const derivedAtom = create((get) => get(store.getState, store.subscribe))
```

## Enhanced atoms

An enhanced atom is an atom whose default `.set` method is swapped with something else. This technique can be used to create "pass through atoms" that act as a mediators. Most people using **xoid** will not need to write enhanced atoms. 

```js
import store from './reduxStore'

const $mediator = create((get) => get(store.getState, store.subscribe))

// we give up `$mediator`'s own `.set` method and swap it with a `store.dispatch` call
$mediator.set = (value: number) => store.dispatch({ type: 'ACTION', payload: value })

$mediator.update(s => s + 1) // modifications to `$mediator` will be directly forwarded to Redux dispatch.
```
> Swapping `.set` also affects `.update`, because it uses `.set` internally. This is an intentional feature.

## Streams

With no arguments used, `create` function produces a special atom called a `Stream`.

```js
const $element = create<HTMLElement>() // Stream<HTMLElement>

// the state is satisfied later
$element(document.body)
```

`Stream`s are almost identical to atoms. In **xoid** world, there are two ways to create a stream:
- Atoms that start off with zero arguments like above. 
- Filtering via `.map` method + `true` as the second argument. 

Here's the difference of the two, from the `index.d.ts` file of **xoid**. 

```js
export type Atom<T> = {
  value: T
  get(): T
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
  get(): T | undefined
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
```
> Observe that the few major differences are the `.value` getter and bunch of `prevState`s.