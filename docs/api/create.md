---
id: create
title: create
---

`import { create } from 'xoid'`

`create` is the store creator function. It returns a proxy object that _represents_ state. This representation of state has the same tree structure with the actual state. It's values are not directly readable, nor it can be modified. To interact with the state; [`get`](get) , [`set`](set) , [`use`](use) , [`subscribe`](subscribe) core methods are used.

## Basic state

Create a store by using the first argument as the initial state. State can be an object, an array, or a primitive such as a number, a string or a symbol.

```js
const alpha = create(5);
const deepStore = create({ deeply: { nested: { value: 'OK' } } });
```

`deepStore` will have the same shape with its state. So, `deepStore.deeply.nested.value` is an observable address that exists in the store.

## Derived state

By providing a function as the first argument, you can create a store that's value is derived by other stores.

```js
const sum = create((get) => get(alpha) + get(beta));
```

> If you are familiar with **Recoil**, you can think of `xoid.create` as both Recoil functions combined: `Recoil.atom` , and `Recoil.selector`.

## Defining actions

`create` function has an optional second argument which accepts a function. This function runs only once after the state is created. Return value of this function is stored internally, to be used by [`use`](use) method.

```js
import { create, set, use, useStore } from 'xoid';

const storeWithActions = create(5, (store) => ({
  increment: () => set(store, (state) => state + 1),
  reset: () => set(store, 0)
}));

use(storeWithActions).increment();

// also, in a React component
const [value, { increment }] = useStore(storeWithActions);
```

You can use this second argument to define actions for your store. See the documentation for [`use`](use) for some possible patterns.
