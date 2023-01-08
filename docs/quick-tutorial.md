---
id: quick-tutorial
title: Quick Tutorial
---

> You can skip this part if you've already read the Github README.


**xoid** has only one export: `create`. Create is also exported as the default export.

`import { create } from 'xoid'`
`import create from 'xoid'`

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

// later
unsub()
```
> To cleanup side-effects, a function can be returned in the subscriber function. (Just like `React.useEffect`)

### React integration

**@xoid/react** is based on two hooks. `useAtom` subscribes the component to an atom. If a second argument is supplied, it'll be used as a selector function.

```js
import { useAtom } from '@xoid/react'

// in a React component
const state = useAtom(atom)
```

The other hook is `useSetup`. It can be used for creating local component state. It's similar to `React.useMemo` with empty dependencies array. It'll run its callback **only once**.

```js
import { useSetup } from '@xoid/react'

const App = () => {
  const $counter = useSetup(() => create(5))

  ...
}
```

> `useSetup` is guaranteed to be **non-render-causing**. Atoms returned by that should be explicitly subscribed via `useAtom` hook.

An outer value can be supplied as the second argument. It'll turn into a reactive atom.

```js
import { useSetup } from '@xoid/react'

const App = (props: Props) => {
  const setup = useSetup(($props) => {
    // `$props` has the type: Atom<Props>
    // this way, we can react to `props.something` as it changes
    $props.focus(s => s.something).subscribe(console.log)
  }, props)

  ...
}
```

---

In the following sections, you'll find more detailed explanation of the API.