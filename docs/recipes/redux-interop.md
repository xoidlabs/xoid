---
id: redux-interop
title: Using in existing Redux project
---

**xoid** and Redux can coexist in a project. There's absolutely no necessity to get rid of Redux when **xoid** is added. However, one may want to integrate **xoid**'s advantages to Redux part of the app as well, and it's definitely possible. 

One thing you can do is to manage your Redux state via **xoid**. You can follow these steps for that:

#### Step 1: create an "omnipotent" action that has the ability to replace the Redux state

This can be just a partial state in a non-root reducer too.

```js
const someExistingReducer = (state, action) => {
  switch(action.type) {
    case 'EXTERNAL_XOID_UPDATE': {
      return action.payload
    }
    ... // other `case` clauses
  }
```

#### Step 2: Create ReduxMediator model, that will forward subscriptions and state modifications directly to the Redux store

```js
const ReduxMediator = (store, actionType, createUseables) => create(
  // make it derived (explained below)
  (get) => get(store.getState, store.subscribe), 
  createUseables,
  // make it enhanced (explained below)
  () => (payload) => store.dispatch({ type: actionType, payload })
)
```

> If a partial Redux state is desired, A **reselect** selector instead of the `store.getState` can be used. Second argument remains same as `store.subscribe`.

#### Step 3: Use the model

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

> ### `ReduxMediator` explained
>
> This model returns a derived & enhanced atom. First argument makes it derived, and the third argument makes it enhanced.
>
> First, let's start with derived part. Usually, atoms are derived from other atoms (as `create(get => get(otherAtom))`). `get` here, has a rarely used additional overload. When the first argument of it is not a **xoid** atom, it can derive the state from other things such as a Redux store, an RxJS observable, or or any other thing that implements getState & subscribe pair.
>
> An enhanced atom is an atom with different "setter" behavior. Optional third argument of `create` lets you override the default setter function. It's generally used to create non-writable atoms like above.