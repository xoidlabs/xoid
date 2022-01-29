---
id: quick-tutorial
title: Quick Tutorial
---

> You can skip this part if you've already read the Github README.

**xoid** has only 6 exports: `create`, `effect`, `subscribe`, `use`, `select` and `lens`. This tutorial will cover all of them, and the **@xoid/react**.

### Atom

**xoid** is based on atoms. Atoms are standalone setter/getter objects that hold state. `create` function is used to create them.

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

> Type of `deepBeta` would be `Atom<number>`. It's a subscribable getter/setter object just like any other atom.

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
:::info Hint
To cleanup side-effects, a function can be returned in the subscriber function. (Just like `React.useEffect`)
:::

## React integration

**@xoid/react** is based on two hooks. `useAtom` subscribes the component to the atoms.

```js
import { useAtom } from '@xoid/react'

// in a React component
const state = useAtom(atom, s => s.alpha)
```

The other hook is `useSetup`. It can be used for creating local component state. It runs its callback function only **once**. The difference from `React.useMemo` is that, the second argument is not a dependency array. Instead, it's a slot to **consume an outer variable as a reactive atom**.

```js
import { subscribe, select } from 'xoid'
import { useSetup } from '@xoid/react'

const App = (props: Props) => {
  const setup = useSetup((deps) => {
    // `deps` has the type: Atom<Props>
    subscribe(select(deps, s => s.something), console.log)

    const alpha = create(5)
    return { alpha }
  }, props)
}
```

> `useSetup` is guaranteed to be **non-render-causing**. Atoms returned by that should be explicitly subscribed via `useAtom` hook.

## More features

### Feature: Optics (lenses)

`lens` takes either an atom, or a plain object. It's similar to `select`, but surgical changes won't be immutably propagate to root. Instead, the original object will be mutated.
```js
import { lens } from 'xoid'

const obj = { some: { value: 5 } }
const someValueLens = lens(obj, (s) => s.some.value)
someValueLens(512)
console.log(obj) // { some: { value: 512 } }
```
> Type of `someValueLens` would be: `Lens<{ some: { value: number } }>`.

### Pattern: Finite state machines

No additional syntax is required for state machines. Just use the good old `create` function.

```js
import { create } from 'xoid'
import { useAtom } from '@xoid/react'

const createMachine = () => {
  const red = { color: '#f00', onClick: () => atom(green) }
  const green = { color: '#0f0', onClick: () => atom(red) }
  const atom = create(red)
  return atom
}

// in a React component
const machine = useSetup(createMachine)
const { color, onClick } = useAtom(machine)
return <div style={{ color }} onClick={onClick} />
```