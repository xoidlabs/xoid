---
id: redux-interop
title: Using in existing Redux project
---

If you'd like to manage your redux state via **xoid**, you can follow these steps:

#### Step 1: create an "omnipotent" action that has the ability to replace the Redux state

```js
const someExistingReducer = (state, action) => {
  switch(action.type) {
    case 'EXTERNAL_XOID_UPDATE': {
      return action.payload
    }
    ... // other `case` clauses
  }
```

#### Step 2: Use the following xoid model to create a "mediator" atom, that forwards subscriptions and state modifications directly to the Redux store

```js
const ReduxMediator = (store, actionType, createUseables) => create(
  // make it derived (explained below)
  (get) => get(store.getState, store.subscribe), 
  createUseables,
  // make it non-writable (explained below)
  () => (payload) => store.dispatch({ type: actionType, payload })
)
```

Usage:

```js
import reduxStore from './reduxStore'

const atom = ReduxMediator(
  reduxStore, 
  'EXTERNAL_XOID_UPDATE',
  (atom) => ({
    increment: () => atom(s => s + 1)
  })
)
```

Done!

#### What's going on here:

> When used on non-atoms, `get` needs two functions: a state getter function, and a subscribe function. This way, We can make our atom directly derived from Redux state. If a partial Redux state is desired, A **reselect** selector instead of the `store.getState` can be used. Second argument remains same as `store.subscribe`.

> Optional third argument of `create` function lets you set the function to use instead of the default "setter" function. It's generally used to create non-writable atoms. In this case, new states are directly forwarded to Redux via a predefined action.


### Middleware

This functionality was heavily inspired by **Zustand**.

Optional third argument of `create` function can be used to override what setting the state does.

```js
// Log every time state is changed
const logMiddleware = ({ set }, atom) => (value) => {
  console.log("  applying", value)
  set(value)
  console.log("  new state", atom())
})
```

```js
// Log every time state is changed
const logMiddleware = ({ set }, atom) => ({
  set: (value) => {
    console.log("  applying", value)
    set(value)
    console.log("  new state", atom())
  })
})
```

```js
// Turn the set method into an immer proxy
const immerMiddleware = ({ set }) => config((partial, replace) => {
  const nextState = typeof partial === 'function'
      ? produce(partial)
      : partial
  return set(nextState, replace)
})
```

Empty or falsy third argument, a function with a falsy return value, or `({ set }) => set` is equivalent to using no middlewares.


- redux model
- class component model
- redux mediator model
- funnel
```js
create(init, null, () => onChange)
```
- react funnel


Interact any "stateful" structure as if it's a **xoid** atom.

In React, a "value-onChange pair" is the most intuitive way of sharing state. Passing a value-onChange pair as a prop is a very common practice. A "state-setState pair" is just another type of it. It's the same, but it's for local component state. It can also be passed down to child components just like a value-onChange. Its setter function has slightly different characteristics.

There's nothing wrong with this pair. In this article however, I'll mention a case wher
working with immutability and how **xoid** can help you write simpler actions.


```js
const PairModel = (atom) => create(
    (get) => get(atom, 0), 
    null, 
    () => (value) => atom()[1](value)
  )

// inside React
const atom = useSetup(PairModel, [value, onChange])
const setAlpha = use(atom, (s) => s.deep.alpha)
const setBeta = use(atom, (s) => s.deep.beta)

