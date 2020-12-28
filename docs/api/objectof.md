---
id: objectof
title: objectOf
---

`import { objectOf } from 'xoid'`

It creates an object store, based on the model in it's first argument. The second argument is optional. If provided, it will be used as the initial state, otherwise an empty object is used.

```js
import { objectOf, get, set, use } from 'xoid';

const NumberModel = (payload: number) =>
  create(payload, (store) => ({
    increment: () => set(store, (state) => state + 1),
    decrement: () => set(store, (state) => state - 1)
  }));

const numbers = objectOf(NumberModel, { a: 1, b: 3 }); // second argument is optional

use(numbers).add(5, 'c');
use(numbers).add(7, 'd');
Object.keys(numbers).forEach((key) =>
  use(numbers[key]).increment()
);
console.log(current(numbers)); // { a: 2, b: 4, c: 6, d: 8 }
```

It has `add` and `remove` actions, fully type-consistent with your models.

```js
{
  // simply add by your payload definition and key
  add: (item: ModelPayload, key: string) => void
  // Two overloads: remove by key or filter function
  remove: (match: string | ((item: ModelPayload) => boolean)) => void
}
```
