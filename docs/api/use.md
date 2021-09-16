---
id: use
title: use
---

`import { use } from 'xoid'`

`use` method grabs the "usables" of a store. Usables are defined by using the [`model`](model) function.

```js
import { model, set, use, useStore } from 'xoid';

const CounterModel = model((store) => ({
  incrementBy: (by: number) => store((state) => state + by),
  reset: () => store(0)
}));

const counter = CounterModel(5)

use(counter).incrementBy(20); // void

counter() // 25
```

It will throw an error when it's applied to non-observable values:

```js
use({}); // throws
```

:::tip Tip
For an enhanced developer experience, `@xoid/devtools` package can be used. Please see [Redux Devtools integration](../recipes/redux-devtools-integration) in the Recipes section.
:::