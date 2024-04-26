---
id: using-reducers
title: Using reducers
---

You can easily use your existing reducers with **xoid**. The following function can be used to create an atom with reducer.

```js
const atomWithReducer = (reducer, initialState) => atom(
  initialState, 
  (a) => ({ dispatch: (action) => a.update((s) => reducer(s, action)) })
)
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
const countAtom = atomWithReducer({ count: 0 }, counterReducer)

countAtom.actions.dispatch({ type: types.increase, by: 1 })
```

Connecting existing reducers to **xoid** can be beneficial, especially if you're planning to gradually refactor your reducers. The above reducer can be simplified into to the following:

```js
const CounterModel = (s) => atom(s, (a) => {
  const $count = a.focus('count')
  return {
    increment: (by) => $count.update(s => s + by),
    decrement: (by) => $count.update(s => s - by),
  }
})
```

To see another demonstration with a more dramatic refactor, you can check [Working with nested state](nested-state)

Related: [Using in an existing Redux App](redux-interop)
