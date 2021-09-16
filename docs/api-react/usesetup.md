---
id: usemodel
title: useModel
---

`import { useModel } from 'xoid'`

This export is used for creating a local store inside a React component. Check [Local state](recipes/local-state) in the Recipes section for some examples.

```js
import { create, set, useModel } from 'xoid'

const CounterModel = () => create(0, (store) => ({
  inc: set(store, s => s + 1)
}))

const App = () => {
  const [count, {inc}] = useModel(CounterModel)
  return <div onClick={inc}>{count}</div>
}
```
