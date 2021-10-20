---
id: create
title: create
---

`import { create } from 'xoid'`

`create` is used to create atoms. Atoms are standalone setter/getter objects that hold state. `create` function is used to create them.

```js
import { create } from 'xoid'

const atom = create(3)
atom() // 3 (get the value)
atom(5) // void (set the value to 5)
atom(state => state + 1) // void (also set the value)
atom() // 6
```

Atoms can have actions, and with `use` function they can be used.

```js
import { create, use } from 'xoid'

const numberAtom = create(5, (atom) => ({
  increment: () => atom(s => s + 1),
  decrement: () => atom(s => s - 1)
}))

use(numberAtom).increment()
```

By providing a function as the first argument, a derived atom can be created.

```js
import { alpha, beta } from './some-file'

const sum = create((get) => get(alpha) + get(beta));
```

## Grabbing refs

With no arguments used, `create` function can be used to grab refs.

```js
const $ref = create<HTMLElement>() // Atom<HTMLElement | undefined>

$ref(document.body)
```