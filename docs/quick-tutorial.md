---
id: quick-tutorial
title: Quick Tutorial
---

> You can skip this part if you've already read the Github README.


**xoid** has only 2 exports: `create` and `use`. This section will cover them, and the **@xoid/react**.

### Atom

Atoms are holders of state. `create` function is used to create them.

```js
import { create } from 'xoid'

const atom = create(3)
console.log(atom.value) // 3
atom.set(5)
atom.update(state => state + 1)
console.log(atom.value) // 6
```

Atoms can have actions, and with `.use` method they can be used.

```js
import { create, use } from 'xoid'

const numberAtom = create(5, (atom) => ({
  increment: () => atom.update(s => s + 1),
  decrement: () => atom.update(s => s - 1)
}))

use(numberAtom).increment()
```


There's the `.focus` method, which can be used as a selector/lens. **xoid** is based on immutable updates, so if you "surgically" set state of a focused branch, changes will propagate to the root.

```js
import { create } from 'xoid'

const atom = create({ deeply: { nested: { alpha: 5 } } })
const previousValue = atom.value

// select `.deeply.nested.alpha`
const alpha = atom.focus(s => s.deeply.nested.alpha)
alpha.set(6)

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
```
> To cleanup side-effects, a function can be returned in the subscriber function. (Just like `React.useEffect`)

### React integration

**@xoid/react** is based on two hooks. `useAtom` subscribes the component to an atom. If a second argument is supplied, it'll be used as a selector function.

```js
import { useAtom } from '@xoid/react'

// in a React component
const state = useAtom(atom)
```

The other hook is `useSetup`. It can be used for creating local component state. It'll run its callback **only once**. If a second argument is supplied, it'll be used for communication between the closure (`useSetup` scope) and outside (React component scope).

```js
import { useSetup } from '@xoid/react'

const App = (props: Props) => {
  const setup = useSetup(($props) => {
    // `$props` has the type: Atom<Props>
    // this way, we can react to `props.something` as it changes
    $props.focus(s => s.something).subscribe(console.log)

    const alpha = create(5)
    return { alpha }
  }, props)

  ...
}
```

> `useSetup` is guaranteed to be **non-render-causing**. Atoms returned by that should be explicitly subscribed via `useAtom` hook.

---

This is all you need to know to start using **xoid**. In the following sections, you'll find more detailed explanation of the API.