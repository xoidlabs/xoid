---
id: creating-react-custom-hooks
title: Creating React custom hooks
---

```js
const CounterModel = (value: number) =>
  atom(value, (a) => ({
    increment: () => a.update((s) => s + 1),
    decrement: () => a.update((s) => s - 1),
  }))

const useCounter = (value: number) => useAtom(() => CounterModel(value), true)
```
> With the second argument set to `true`, `useAtom` returns a 2-item tuple.

```js
const [state, { increment, decrement }] = useCounter(0)
```
