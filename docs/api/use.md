---
id: use
title: use
---

`import { use } from 'xoid'`

`use` method lets you use the actions that are specified in the second argument of [`create`](create#defining-store-actions).

```js
import { create, set, use, useStore } from 'xoid';

const storeWithActions = create(5, (store) => ({
  increment: (by: number) => set(store, (state) => state + by),
  reset: () => set(store, 0)
}));

use(storeWithActions).increment(20); // void

console.log(get(storeWithActions)); // 25
```

It will throw an error when it's applied to non-store values:

```js
use({}); // throws
```
