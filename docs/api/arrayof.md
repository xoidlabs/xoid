---
id: arrayof
title: arrayOf
---

`import { arrayOf } from 'xoid'`

`arrayOf`, along with [`objectOf`](`objectOf`), is part of the concept of models. It creates an array store, based on the model in it's first argument. The second argument is optional. If provided, it will be used as the initial state, otherwise an empty array is used.

```js
import { arrayOf, current, set, use } from 'xoid';

const NumberModel = (payload: number) =>
  create(payload, (store) => ({
    increment: () => set(store, (state) => state + 1),
    decrement: () => set(store, (state) => state - 1)
  }));

const numbers = arrayOf(NumberModel, [1, 3]); // second argument is optional

use(numbers).add(5);
use(numbers).add(7);
numbers.forEach((number) => use(number).increment());
console.log(current(numbers)); // [2, 4, 6, 8]
```

It has `add` and `remove` actions, fully type-consistent with your models.

```js
{
  // simply add by your payload definition
  add: (item: ModelPayload) => void
  // Two overloads: remove by array index or filter function
  remove: (match: number | ((item: ModelPayload) => boolean)) => void
}
```
