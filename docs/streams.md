---
id: streams
title: Streams
--- 

**xoid** offers basic support for **streams**. Streams are generally treated as a whole different concept than atoms. They're actually very close, and there's no need for a completely different library for them. **xoid** thinks that streams can easily be a a "bonus feature" of an atomic state management library. 

Our definition of a stream is the following:

> A **stream** is an **atom** that **may not** have an immediate value.

**xoid** have a separate `Stream` type along with the `Atom`.
Streams differ from atoms not only by types, but also in terms of the runtime behaviour. 

There are two ways to produce a stream in **xoid**:
- Using the `.map` method with `true` as the second argument 
- Using `atom` with no arguments

### Using the `.map` method with `true` as the second argument 

Imagine we're setting up a basic counter, and we're deriving another counter that takes only the odd values from the first.
We can set this up in the following way:
```js
const $counter = atom(0)
const $odd = $counter.map((s) => s % 2 ? s : undefined, true) 
// Type of `$odd` would be `Stream<number>`
```
`true` in the second argument means "filter out falsy values" here. 
If we didn't use this overload of `.map`, we would end up with a `Atom<number | undefined>`.
However, we would lose the following benefits:

```js
const $doubleOdd = $odd.map((value) => value * 2)
```
Here, the type of `value` is always a `number`. If we were working with a `Atom<number | undefined>` instead of a `Stream<number>`, `value` would also be `number | undefined` and our code would be slightly more verbose to cover those cases.

### Using `atom` with no arguments

When no arguments are used, `atom` function produces a `Stream` instead of an `Atom`. Let's assume we're creating a `$clickStream` and a `$clickAtom` like the following:

```js
import { atom } from 'xoid'

const $clickStream = atom<MouseEvent>() // Stream<MouseEvent>
const $clickAtom = atom<MouseEvent | undefined>(undefined) // Atom<MouseEvent | undefined>

// Imagine we're going to satisfy the internal value of these atoms later as:
window.addEventListener('click', $clickStream.set)
window.addEventListener('click', $clickAtom.set)
```
> Note that in JavaScript, calling a function with no arguments can be different than calling it with `undefined`, if the internal implementation of the function makes use of the `arguments.length` builtin. **xoid** makes use of exactly that.

Let's look at the similarities and differences between `$clickStream` and `$clickAtom`. 
First of all, their `.value` getter types are the same.

```js
$clickStream.value // MouseEvent | undefined
$clickAtom.value // MouseEvent | undefined
```

However, there's a difference in `.set` method's types. This applies for `.update` as well.

```js
$clickStream.set // (value: MouseEvent) => void
$clickAtom.set // (value: MouseEvent | undefined) => void
```

A stream's key feature is the behavior of its `.map` and `.focus` methods. 
First, let's look at the `.map` method's types.

```js
$clickStream.map((value) => { /* `value` has the `MouseEvent` type */ })
$clickAtom.map((value) => { /* `value` has the `MouseEvent | undefined` type */ })
```
As you can see, even though `$clickStream` starts off `undefined` as its internal value, we do not run into any `undefined` type inside the `.map` method callback. This can be beneficial, because now you can chain multiple `.map` methods without caring about the `undefined` states.

```js
const double = (value: number) => value * 2

const $doubleX = clickStream
  .map((event) => event.clientX)
  .map(double)
```

---

Lastly, here's the difference of the two, from the `index.d.ts` file of **xoid**. 

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
```
> Observe that the few major differences are the `.value` getter and bunch of `prevState`s.