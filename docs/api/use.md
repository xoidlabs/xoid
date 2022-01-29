---
id: use
title: use
---

`import { use } from 'xoid'`

`use` method grabs the "useables" of a store. Useables are defined by the second argument of `create` function.

```js
import { create, use } from 'xoid'

const numberAtom = create(5, (atom) => ({
  increment: () => atom(s => s + 1),
  decrement: () => atom(s => s - 1)
}))

use(numberAtom).increment()
```

:::tip Tip
For an enhanced developer experience, `@xoid/devtools` package can be used.
:::