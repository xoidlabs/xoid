---
id: using-reducers
title: Using reducers
---

**xoid** doesn't need reducers, but if you prefer to use them, or if you're moving away from Redux, but want to reuse your existing reducers, you can easily do that with **xoid**. 

The following function can be used to create a Redux-like atom.

```js
const createStore = (reducer, state) => {
  const atom = create(state)
  const dispatch = (action) => atom.update((s) => reducer(s, action))
  return { atom, dispatch }
}
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
const { atom, dispatch } = createStore({ count: 0 }, counterReducer)

dispatch({ type: types.increase, by: 1 })
```

Connecting existing reducers to **xoid** can be beneficial, especially if you're planning to gradually refactor your reducers. The above reducer can be simplified into to the following:

```js
const CounterModel = (state) => create(state, (atom) => {
  const $count = atom.focus('count')
  return {
    increment: (by) => $count.update(s => s + by),
    decrement: (by) => $count.update(s => s - by),
  }
})
```

To see another demonstration with a more dramatic refactor, you can check [Working with nested state](nested-state)

Related: [Using in an existing Redux App](redux-interop)
