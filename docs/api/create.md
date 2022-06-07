---
id: create
title: create
---

`import { create } from 'xoid'`

`create` is used to create atoms. Atoms are standalone setter/getter objects that hold state. 

```js
import { create } from 'xoid'

const atom = create(3)
atom() // 3 (get the value)
atom(5) // void (set the value to 5)
atom(state => state + 1) // void (also set the value)
atom() // 6
```

Atoms can have actions, and with `use` function they can be used.

```js
import { create, use } from 'xoid'

const numberAtom = create(5, (atom) => ({
  increment: () => atom(s => s + 1),
  decrement: () => atom(s => s - 1)
}))

use(numberAtom).increment()
```

## Derived state

By providing a state initializer function, a derived atom can be created.

```js
import { alpha, beta } from './some-file'

const sum = create((get) => get(alpha) + get(beta))
```

## Lazy evaluation

State initializer functions are lazily evaluated. This means that they don't run unless an atom's state is being read or subscribed. **xoid** can be used as a dependency injection mechanism like in the following example:

```js
import { expensiveComputation } from './some-file'

const $dep1 = create(() => expensiveComputation(5))
const $dep2 = create(() => expensiveComputation(8))
const $total = create((get) => get($dep1) + get($dep2))
// none of the state initializer functions are evaluated until this point

const value = $total()
// all of them are evaluated
```

## Grabbing refs

With no arguments used, `create` function can be used to grab refs.

```js
const $ref = create<HTMLElement>() // Atom<HTMLElement | undefined>

$ref(document.body)
```

## Deriving state from external sources (Advanced)

With an additional feature of `get` function above, you can get the state from non-atoms. This can be a Redux store, an RxJS observable, or anything that implements getState & subscribe pair. Here is an atom that derives its state from a Redux store.

```js
import store from './reduxStore'

const derivedAtom = create((get) => get(store.getState, store.subscribe))
```

## Enhanced atoms (Advanced)

An enhanced atom is an atom with different "setter" behavior. Optional third argument of `create` is called an *enhancer*. It's used for returning a function to be used instead of the default setter function. Most people using **xoid** will not need to write enhancers. 

Following is a simple "logger middleware" created with **xoid**:

```js
import store from './reduxStore'

const enhancedAtom = create(
  5,
  null,
  (defaultSetter) => 
    (state) => {
      console.log('state before:', atom())
      defaultSetter(state)
      console.log('state after:', atom())
    }
)
```