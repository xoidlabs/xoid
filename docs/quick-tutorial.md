---
id: quick-tutorial
title: Quick Tutorial
---

> You can skip this part if you've already read the Github README.

### Atom

Atoms are holders of state.

```js
import { atom } from 'xoid'

const $count = atom(3)
console.log($count.value) // 3
$count.set(5)
$count.update((state) => state + 1)
console.log($count.value) // 6
```

Atoms can have actions.

```js
import { atom } from 'xoid'

const $count = atom(5, (a) => ({
  increment: () => a.update(s => s + 1),
  decrement: () => a.value-- // `.value` setter is supported too
}))

$count.actions.increment()
```

There's the `.focus` method, which can be used as a selector/lens. **xoid** is based on immutable updates, so if you "surgically" set state of a focused branch, changes will propagate to the root.

```js
import create from 'xoid'

const $atom = atom({ deeply: { nested: { alpha: 5 } } })
const previousValue = $atom.value

// select `.deeply.nested.alpha`
const $alpha = $atom.focus(s => s.deeply.nested.alpha)
$alpha.set(6)

// root state is replaced with new immutable state
assert($atom.value !== previousValue) // ✅
assert($atom.value.deeply.nested.alpha === 6) // ✅
```


### Derived state

State can be derived from other atoms. This API was heavily inspired by **Recoil**.

```js
const $alpha = atom(3)
const $beta = atom(5)
// derived atom
const $sum = atom((read) => read($alpha) + read($beta))
```

Alternatively, `.map` method can be used to quickly derive the state from a single atom.

```js
const $alpha = atom(3)
// derived atom
const $doubleAlpha = $alpha.map((s) => s * 2)
```
> Atoms are lazily evaluated. This means that the callback functions of `$sum` and `$doubleAlpha` in this example won't execute until the first subscription to these atoms. This is a performance optimization.

### Subscriptions

For subscriptions, `subscribe` and `watch` are used. They are the same, except `watch` runs the callback immediately, while `subscribe` waits for the first update after subscription.

```js
const unsub = $atom.subscribe((state, previousState) => {
  console.log(state, previousState)
})

// later
unsub()
```
> This concludes the basic usage! 🎉
