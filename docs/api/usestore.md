---
id: usestore
title: useStore
---

`import { useStore } from 'xoid'`

React hook that's used for consuming a store or a store member. It looks and feels like the `React.useState`. When used on a nested store, it **won't** directly subscribe to its child stores. Child stores will only be subscribed if you actually read, or destructure values of them. This prevents unnecessary UI updates. `mobx-react`'s `observe` was an inspiration for this.

## Basic store 😗

```js
import { create, useStore } from 'xoid';

const store = create({ name: 'John', surname: 'Doe' });

// in a React component
const [name, setName] = useStore(store.name);
```

## Store with actions 😘

```js
import { create, useStore } from 'xoid';

const numberStore = store(0, {
  increment: (store) => set(store, (state) => state + 1),
  decrement: (store) => set(store, (state) => state - 1)
});

// in a React component
const [number, { increment, decrement }] = useStore(numberStore);
```

## Explicit version 🤬

Also, there's this overload, which no longer resembles `React.useState`, but is more formal, kind of framework-agnostic and explicit.

You may prefer this overload if:

- The same React component subscribes to multiple stores
- You want to be explicit about what the component will subscribe
- You are already using [`get`](get) export and `useStore`'s first overload inside a component, and it started to get confusing

```js
// in a React component
const get = useStore()
return <>
  <input value={get(someStore.deep.value)} onChange={...} >
  <input value={get(someStore.someOtherValue)} onChange={...} >
<>
```
