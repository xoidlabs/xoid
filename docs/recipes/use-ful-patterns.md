---
id: use-ful-patterns
title: "'Use'ful patterns"
---

### Getters for derived state

Usually, "usable" of a store would be an object of functions. However, there are no limitations on what `use` method will return. One possibly useful pattern is adding some derived state as getters.

```js
const store = create(
  {
    alpha: 3,
    beta: 5
  },
  (store) => {
    const sum = create((get) => get(store.alpha) + get(store.beta))
    const product = create((get) => get(store.alpha) * get(store.beta))
    return {
      get sum() { return sum() },
      get product() { return product() }
    };
  }
);
```

### Array of functions

Actions without explicit names can be preferred too.

```js
const atomWithActions = create(5, (atom) => {
  const increment = () => atom((s) => s + 1);
  const decrement = () => atom((s) => s - 1);
  return [increment, decrement];
});
const [inc, dec] = use(atomWithActions);
```
