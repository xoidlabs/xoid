---
id: arrayof
title: arrayOf
---

`import { arrayOf } from 'xoid'`

Models are special **create** functions. `arrayOf` creates a special **create** function that receives an array as the initial state. It makes sure that each array element is of the same model type. Second argument can optionally be used to attach usables to the root itself.

```js
import { model, arrayOf, use } from 'xoid';

const NumberModel = model((store) => ({
  increment: () => store((state) => state + 1),
  decrement: () => store((state) => state - 1)
}))

const NumberArrayModel = arrayOf(NumberModel, (store) => ({
  add: (num: number) => store(state => [...state, num])
}))

const numbers = NumberArrayModel([1, 3])
use(numbers).add(5)
use(numbers).add(7)
Object.entries(numbers).forEach(([_key, num]) => use(num).increment())

numbers() // [2, 4, 6, 8]
```
