---
id: select
title: select
---

`import { select } from 'xoid'`

`select` function makes it easy to work with deep branches of state. **xoid** is based on immutable updates, so if you "surgically" set state of a selected branch, changes will propagate to the root.

```js
import { create, select } from 'xoid'

const atom = create({ alpha: ['foo', 'bar'], deep: { beta: 5 } })
const previousState = atom()

// select and modify `.deep.beta` address
const deepBeta = select(atom, s => s.deep.beta)
deepBeta(s => s + 1)

// root state is replaced with new immutable state
assert(atom() !== previousState) // ✅
assert(atom().deep.beta === 6) // ✅
```

`select` has another overload for "plucking" state partials.

```js
const $alpha = select(atom, 'alpha')
// same as
const $alpha = select(atom, s => s.alpha)
```