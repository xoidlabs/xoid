---
id: quick-tutorial
title: Quick Tutorial
---

> You can skip this part if you've already read the Github README.

**xoid** is extremely easy to learn. 


### Atom

Atoms are holders of state.

```js
import { create } from 'xoid'

const atom = create(3)
console.log(atom.value) // 3
atom.set(5)
atom.update((state) => state + 1)
console.log(atom.value) // 6
```

Atoms can have actions if the second argument is used.

```js
import { create } from 'xoid'

const numberAtom = create(5, (atom) => ({
  increment: () => atom.update(s => s + 1),
  decrement: () => atom.update(s => s - 1)
}))

numberAtom.actions.increment()
```

There's the `.focus` method, which can be used as a selector/lens. **xoid** is based on immutable updates, so if you "surgically" set state of a focused branch, changes will propagate to the root.

```js
import { create } from 'xoid'

const atom = create({ deeply: { nested: { alpha: 5 } } })
const previousValue = atom.value

// select `.deeply.nested.alpha`
const alphaAtom = atom.focus(s => s.deeply.nested.alpha)
alphaAtom.set(6)

// root state is replaced with new immutable state
assert(atom.value !== previousValue) // ✅
assert(atom.value.deeply.nested.alpha === 6) // ✅
```

### Derived state

Atoms can be derived from other atoms. This API was heavily inspired by **Recoil**.

```js
const alpha = create(3)
const beta = create(5)
// derived atom
const sum = create((get) => get(alpha) + get(beta))
```

Alternatively, `.map` method can be used to quickly derive the state from a single atom.

```js
const alpha = create(3)
// derived atom
const doubleAlpha = alpha.map((s) => s * 2)
```

### Subscriptions

For subscriptions, `subscribe` and `watch` are used. They are the same, except `watch` runs the callback immediately, while `subscribe` waits for the first update after subscription.

```js
const unsub = atom.subscribe(
  (state, previousState) => { console.log(state, previousState) }
)

// later
unsub()
```
> To cleanup side-effects, a function can be returned in the subscriber function. (Just like `React.useEffect`)
