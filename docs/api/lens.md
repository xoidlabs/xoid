---
id: lens
title: lens
---

`import { lens } from 'xoid'`

`lens` is similar to `select`. 

`lens` takes either an atom, or a plain object. It's similar to `select`, but surgical changes won't be immutably propagate to root. Instead, the original object will be mutated.
```js
import { lens } from 'xoid'

const obj = { some: { value: 5 } }
const someValueLens = lens(obj, (s) => s.some.value)
someValueLens(512)
console.log(obj) // { some: { value: 512 } }
```
> Type of `someValueLens` would be: `Lens<{ some: { value: number } }>`.