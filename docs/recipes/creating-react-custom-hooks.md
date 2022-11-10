---
id: creating-react-custom-hooks
title: Creating React custom hooks
---

```js
const CounterModel = (value: number) =>
  create(value, (atom) => ({
    increment: () => atom.update((s) => s + 1),
    decrement: () => atom.update((s) => s - 1),
  }))

const useCounter = (value: number) => useAtom(() => CounterModel(value), true)
```
> With the second argument set to `true`, `useAtom` returns a 2-item tuple, similar to `React.useEffect`. You can make use of this feature to create your own hooks.

```js
const [state, { increment, decrement }] = useCounter(0)
```
