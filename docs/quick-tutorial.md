---
id: quick-tutorial
title: Quick Tutorial
---

> You can skip this part if you've already read the Github README.

**xoid** has only 4 exports: `create`, `effect`, `subscribe`, and `use`. This section will cover all of them, and the **@xoid/react**.

### Atom

Atoms are standalone setter/getter objects that hold state. `create` function is used to create them.

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


`use` function, when used with a second argument, acts as a selector. The selected node will be a subscribable getter/setter object like any other atom. **xoid** is based on immutable updates, so if you "surgically" set state of a selected branch, changes will propagate to the root.

```js
import { create, use } from 'xoid'

const atom = create({ deeply: { nested: { alpha: 5 } } })
const previousState = atom()

// select `.deeply.nested.alpha`
const alpha = use(atom, s => s.deeply.nested.alpha)
alpha(s => s + 1)

// root state is replaced with new immutable state
assert(atom() !== previousState) // ✅
assert(atom().deeply.nested.alpha === 6) // ✅
```

### Derived state

Atoms can be derived from other atoms. This API was heavily inspired by **Recoil**.

```js
import { create } from 'xoid'

const alpha = create(3)
const beta = create(5)
// derived atom
const sum = create((get) => get(alpha) + get(beta))
```

### Subscriptions

For subscriptions, `subscribe` and `effect` are used. They are the same, except `effect` runs the callback immediately, while `subscribe` waits for the first update after subscription.

```js
import { subscribe } from 'xoid'

const unsub = subscribe(
  atom, 
  (state, previousState) => { console.log(state, previousState) }
)
```
> To cleanup side-effects, a function can be returned in the subscriber function. (Just like `React.useEffect`)

## React integration

**@xoid/react** is based on two hooks. `useAtom` subscribes the component to an atom. If a second argument is supplied, it'll be used as a selector function.

```js
import { useAtom } from '@xoid/react'

// in a React component
const state = useAtom(atom, s => s.alpha)
```

The other hook is `useSetup`. It can be used for creating local component state. It'll run its closure **only once**. If a second argument is supplied, it'll be used for communication between the closure (`useSetup` scope) and outside (React component scope).

```js
import { subscribe, use } from 'xoid'
import { useSetup } from '@xoid/react'

const App = (props: Props) => {
  const setup = useSetup(($props) => {
    // `$props` has the type: Atom<Props>
    // this way, we can react to `props.something` as it changes
    subscribe(use($props, s => s.something), console.log)

    const alpha = create(5)
    return { alpha }
  }, props)

  ...
}
```

> `useSetup` is guaranteed to be **non-render-causing**. Atoms returned by that should be explicitly subscribed via `useAtom` hook.

This is a
