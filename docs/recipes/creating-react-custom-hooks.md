```js
const CounterModel = (value: number) =>
  create(value, (atom) => ({
    increment: () => atom.update((s) => s + 1),
    decrement: () => atom.update((s) => s - 1),
  }))

const useCounter = (value: number) => useAtom(() => CounterModel(value), true)
```

```js
const [state, { increment, decrement }] = useCounter(0)
```
