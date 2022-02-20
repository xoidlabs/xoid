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

By providing a function as the first argument, a derived atom can be created.

```js
import { alpha, beta } from './some-file'

const sum = create((get) => get(alpha) + get(beta));
```

## Deriving state from other sources (Advanced)

With an additional feature of `get` function above, you can get the state from non-atoms. This can be a Redux store, an RxJS observable, or anything that implements getState & subscribe pair. Here is an atom that derives its state from a Redux store.

```js
import store from './reduxStore'

const derivedAtom = create((get) => get(store.getState, store.subscribe))
```

## Grabbing refs

With no arguments used, `create` function can be used to grab refs.

```js
const $ref = create<HTMLElement>() // Atom<HTMLElement | undefined>

$ref(document.body)
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