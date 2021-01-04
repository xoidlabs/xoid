---
id: use-ful-patterns
title: "'Use'ful patterns"
---

### Getters for derived state

Usually, "useables" of a store would be an object of functions. However, there are no limitations on what `use` method will return. One useful pattern is adding derived state as getters.

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
      get sum() { return get(sum) },
      get product() { return get(product) }
    };
  }
);
```

### Array of functions

Actions without explicit names can be preferred by returning an array of functions.

```js
const storeWithActions = create(5, (store) => {
  const increment = () => set(store, (state) => state + 1);
  const decrement = () => set(store, (state) => state - 1);
  return [increment, decrement];
});
const [inc, dec] = use(storeWithActions);
```
