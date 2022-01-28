---
id: objectof
title: objectOf
---

This section is incomplete
<!-- `import { objectOf } from 'xoid'`

It's similar to [`arrayOf`](arrayof). 
```js
import { model, objectOf, use } from 'xoid';

const NumberModel = model((store) => ({
    increment: () => store((state) => state + 1),
    decrement: () => store((state) => state - 1)
  }));

const NumberObjectModel = objectOf(NumberModel, (store) => ({
  add: (num: number, key: string) => 
    store(state => ({ ...state, [key]: num }))
}))

const numbers = NumberObjectModel({ a: 1, b: 3 })

use(numbers).add(5, 'c')
use(numbers).add(7, 'd')
Object.entries(numbers).forEach(([_key, num]) =>
  use(num).increment()
)
numbers() // { a: 2, b: 4, c: 6, d: 8 }
``` -->
