---
id: using-immer
title: Using immer
---

While **xoid**'s API surface is kept small intentionally, however there's a way for extensions. 
If you'd like to add a `.produce` method that uses **immer** internally, you can do so like the following.

```js
import { create } from 'xoid'
import { produce } from 'immer'

create.plugins.push((atom) => {
  atom.produce = (fn) => atom.update((s) => produce(s, fn))
})
```

If you're using TypeScript, simply apply the following module augmentation:

```js
declare module 'xoid' {
  interface Atom<T> {
    produce: (fn: (draft: T) => void) => void
  }
  interface Stream<T> {
    produce: (fn: (draft: T) => void) => void
  }
}
```
