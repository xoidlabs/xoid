---
id: using-reducers
title: Using reducers
---

**xoid** doesn't need reducers, but if you prefer to use them, or if you're moving away from Redux, but want to reuse your existing reducers, you can easily do that with **xoid**. 

The following **xoid** model can be used to run reducers.

```js
const StoreModel = (reducer, state) =>
  create(state, (atom) => (action) => atom((s) => reducer(s, action)))
```

Let's take this simple reducer:

```js
const types = { increase: "INCREASE", decrease: "DECREASE" }

const counterReducer = (state, { type, by }) => {
  switch (type) {
    case types.increase: return {
      ...state,
      count: state.count + by 
    }
    case types.decrease: return {
      ...state,
      count: state.count - by
    }
  }
}
```

Usage:

```js
import { use, subscribe } from 'xoid'

const store = StoreModel({ count: 0 }, counterReducer)
const dispatch = use(store)

dispatch({ type: types.increase, by: 1 })
```

Connecting existing reducers to **xoid** can be beneficial especially if you're planning to gradually refactor your reducers. The above reducer can be simplified into to the following:

```js
const CounterModel = (state) => create(state, (atom) => {
  const $count = use(atom, 'count')
  return {
    increment: (by) => $count(s => s + by),
    decrement: (by) => $count(s => s - by),
  }
})
```

To see another demonstration with a more dramatic refactor, you can check [Working with nested state](nested-state)

Related: [Using xoid in an existing Redux App](redux-interop)
