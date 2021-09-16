---
id: create
title: create
---

`import { create } from 'xoid'`


`create` is used to create stores. Stores are standalone setter/getter objects and they're the main means of exchanging observability. 

## Basic state

A store is created with an initial state. The initial state can be anything, it can even be a complex object such as a DOM element.

```js
const store = create(3)
store() // 3 (get the value)
store(5) // void (set the value to 5)
store(state => state + 1) // void (also set the value)
store() // 6
```


In **xoid**, via ES6 Proxies, every store is an observable tree. No selector function is necessary to "focus" a deep branch of state.

```js
const store = create({ alpha: ['foo', 'bar'], deep: { beta: 5 } })
store.alpha() // ['foo', 'bar']
store.deep.beta() // 5
```

## Derived state

By providing a function as the first argument, you can create a store that's value is derived by other stores.

```js
import { alpha, beta } from './some-file'

const sum = create((get) => get(alpha) + get(beta));
```

## Async functions

`create` can also receive async functions.

```js
type SomeValue = {}
declare const asyncFn: (a: any) => Promise<SomeValue>

const store = create(async (get) => {
  const state = get(otherStore)
  return await asyncFn(state)
});
```
> Type of `store` would be `Store<undefined | SomeValue>`

## Mutable stores (refs)

**xoid** is based on immutable updates. This means that any change that's made to store nodes will propagate to the root. This is the desired behavior for most cases. Here's an example of an immutable update.
```js
const previousState = store()

store.deep.beta(s => s + 1)

assert(store.deep.beta() === 6) // ✅
assert(previousState !== store()) // ✅
assert(previousState.deep !== store.deep()) // ✅
```
> Here, `store.deep.beta` is updated, and the update propagated to the ancestor objects (`store.deep` and `store`)

However, sometimes it might be more convenient to apply mutable updates. By setting the second argument to `true`, instead of a `Store`, a `MutableStore` is produced. Mutable stores directly mutate the original object. No propagations or object copying occur.

Mutable stores are convenient for complex object such as the `document.body`.

```js
const $body = create(document.body, true) // MutableStore<HTMLElement>

$body.style.background('blue') // won't try to copy the `body`, as intended
```

Another way of creating a `MutableStore` is using zero arguments. 

```js
const $ref = create<HTMLElement>() // MutableStore<HTMLElement | undefined>
$ref(document.body)
```

The same coding style can be used to grab events.

```js
const $event = create<MouseEvent>() // MutableStore<MouseEvent | undefined>
window.addEventListener('mousemove', $event)
```