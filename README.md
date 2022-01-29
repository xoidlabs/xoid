<p align="center">
  <img width="310" src="https://raw.githubusercontent.com/onurkerimov/xoid/master/logo.svg" />
</p> 

<p align="center">
  <a href="https://bundlephobia.com/result?p=xoid" >
    <img alt="Bundle Size" src="https://img.shields.io/bundlephobia/min/xoid?label=bundle%20size&style=flat&colorA=293140&colorB=d3f9ff">
  </a>
  <a href="https://www.npmjs.com/package/xoid">
    <img alt="Version" src="https://img.shields.io/npm/v/xoid?style=flat&colorA=293140&colorB=d3f9ff">
  </a>
  <a href="https://www.npmjs.com/package/xoid">
    <img alt="Downloads" src="https://img.shields.io/npm/dt/xoid.svg?style=flat&colorA=293140&colorB=d3f9ff"/>
  </a>
</p>

**xoid** (pronounced /ˈzoʊ.ɪd/) is a framework-agnostic state management library. **X** in its name denotes its inspiration from great projects such as Redu**X**, Mob**X** and **X**state. It was designed to be simple and scalable. It has extensive Typescript support.

**xoid** is lightweight (1.2 kB gzipped), but quite powerful. Its composed of building blocks for advanced state management patterns. One of the biggest aims of **xoid** is to unify global state, local component state, and finite state machines in a single API. While doing all these, it also aims to keep itself approachable for newcomers. More features are explained below.


To install, run the following command:

```bash
npm install xoid
```
or
```bash
yarn add xoid
```


## Examples

- [Counter](https://github.com/onurkerimov/xoid/blob/master/examples/counter) [![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat-square&logo=codesandbox)](https://githubbox.com/onurkerimov/xoid/tree/master/examples/counter)

- [Todos (Basic)](https://github.com/onurkerimov/xoid/blob/master/examples/todos-basic) [![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat-square&logo=codesandbox)](https://githubbox.com/onurkerimov/xoid/tree/master/examples/todos-basic)

- [Celcius-Fahrenheit conversion](https://github.com/onurkerimov/xoid/blob/master/examples/celcius-fahrenheit) [![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat-square&logo=codesandbox)](https://githubbox.com/onurkerimov/xoid/tree/master/examples/celcius-fahrenheit)

- [Finite state stopwatch](https://github.com/onurkerimov/xoid/blob/master/examples/finite-state-stopwatch) [![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat-square&logo=codesandbox)](https://githubbox.com/onurkerimov/xoid/tree/master/examples/finite-state-stopwatch)

- [Transient update resize observer](https://github.com/onurkerimov/xoid/blob/master/examples/transient-update-resize-observer) [![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat-square&logo=codesandbox)](https://githubbox.com/onurkerimov/xoid/tree/master/examples/transient-update-resize-observer)

- [Trello clone](https://github.com/onurkerimov/xoid/blob/master/examples/trello) [![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat-square&logo=codesandbox)](https://githubbox.com/onurkerimov/xoid/tree/master/examples/trello)


## Quick Tutorial

**xoid** has only 6 exports: `create`, `effect`, `subscribe`, `use`, `select` and `lens`. This section will cover all of them, and the **@xoid/react**.

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
> To cleanup side-effects, a function can be returned in the subscriber function. (Just like `React.useEffect`)

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

### Redux Devtools integration (WIP)

Import `@xoid/devtools` and connect your atom. It will send generated action names to the Redux Devtools Extension.

```js
import { NumberModel } from './some-file'
import { devtools } from '@xoid/devtools'
import { use, select } from 'xoid'

const alpha = NumberModel(5)
const beta = NumberModel(8)
const gamma = create({ deep: 1000 })
const disconnect = devtools({ alpha, beta, gamma }, 'myStore') 

use(alpha).inc() // "(alpha).inc"
use(beta).inc() // "(beta).inc"
select(gamma, s => s.deep)(3000)  // "(gamma) Update ([timestamp])
```

## Why **xoid**?

- Easy to learn
- Small bundle size
- Framework-agnostic
- Extensive Typescript support
- Easy to work with nested states
- Computed values, transient updates
- Can be used as an optics (lenses) library
- Can also be used to express finite state machines
- No middleware is required for async/generator stuff
- Global state and local component state in the same API

## Other packages

- `@xoid/react` - **React** integration
- `@xoid/devtools` - **Redux Devtools** integration

## Thanks
Following awesome projects inspired **xoid** a lot.
- [Recoil](https://github.com/facebookexperimental/Recoil)
- [zustand](https://github.com/pmndrs/zustand)
- [mobx-state-tree](https://github.com/mobxjs/mobx-state-tree)

Thanks to [Anatoly](http://a-maslennikov.com/) for the icon [#24975](https://www.flaticon.com/free-icon/ruler_245975).

