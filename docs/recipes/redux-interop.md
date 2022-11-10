---
id: redux-interop
title: Using in an existing Redux App
---

**xoid** and Redux can coexist in a project without a problem. There's no requirement to get rid of Redux when **xoid** is added.

If you're planning to gradually move away from Redux, one thing you can do is to start to manage a part of your Redux state via **xoid**. You can follow these steps for that:

### Step 1: create an "omnipotent" action that has the ability to replace the Redux state

```js
const someExistingReducer = (state, action) => {
  switch(action.type) {
    case 'EXTERNAL_XOID_UPDATE': {
      return action.payload
    }
    ... // other `case` clauses
  }
```

### Step 2: Create a "mediator atom"
This will forward subscriptions and state modifications directly to the Redux store.

```js
const $mediatorAtom = create((get) => get(store.getState, store.subscribe))
$mediatorAtom.set = (payload) => store.dispatch({ type: 'EXTERNAL_XOID_UPDATE', payload })
```

> Usually, atoms are derived from other atoms (as `create(get => get(otherAtom))`). However `get` has an additional overload. **xoid** atoms can derive their state from other sources such as Redux stores, or RxJS observables. The key thing is that the external source should in one way or another implement a getState & subscribe pair.
>
> Here, in the second line, the default `set` method is overriden. Any of the methods of xoid atoms can be overriden. This technique is generally used to create non-writable atoms like this one.

> Note: If a partial Redux state is desired, A selector instead of the `store.getState` can be used. Second argument remains same as `store.subscribe`.
