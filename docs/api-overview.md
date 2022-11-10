---
id: api-overview
title: API Overview
---

**xoid** consists of 2 exports: `create`, which is used to create atoms, and `use` which is used to get "usables" of an atom.

Atoms have the following methods:

```js
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
```

Everything about these methods are described in the [quick tutorial section](./quick-tutorial). In the next sections, some advanced features of atoms will be described.