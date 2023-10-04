---
id: redux-interop
title: Using in an existing Redux App
---

**xoid** and Redux can coexist in a project without a problem. There's no requirement to get rid of Redux when **xoid** is added. If you're planning to gradually move away from Redux however, **xoid** is a good candidate to do so. For this, one thing you can do is to start managing some part of your Redux state via **xoid**. You can follow these steps:

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

### Step 2: Create an "enhanced atom"
This will forward subscriptions and state modifications directly to the Redux store.

```js
import { store } from './store'

const $mediatorAtom = create((read) => read(store.getState, store.subscribe))
$mediatorAtom.set = (payload) => store.dispatch({ type: 'EXTERNAL_XOID_UPDATE', payload })
```

> Usually, atoms are derived from other **atoms** (as `create((read) => get($someAtom))`). Observe how `read` is used with two arguments in this example. This is an additional overload that is used to consume an external (non-**xoid**) source. As long as the external source implements some getState & subscribe pair, it can be consumed by **xoid** like this. (See [Deriving state from external sources](../advanced-concepts#deriving-state-from-external-sources))
>
> Also, in the second line, you may see that the default `set` method is overriden. In **xoid**'s terminology, atoms like these are called [enhanced atoms](../advanced-concepts#enhanced-atoms). Overriding the default `set` method also will modify the `update` method's behavior.

> Note: If a partial Redux state is desired, A selector instead of the `store.getState` can be used. Second argument remains same as `store.subscribe`.
