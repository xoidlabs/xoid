---
id: using-immer
title: Using immer
---

`atom` has a `.plugins` array that you can use to enable plugins globally.
If you'd like to add a `.produce` method that uses **immer** internally, you can do it like the following.

```js
import { atom } from 'xoid'
import { produce } from 'immer'

atom.plugins.push((a) => {
  a.produce = (fn) => a.update((s) => produce(s, fn))
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
