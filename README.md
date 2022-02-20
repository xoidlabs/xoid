<p align="center">
  <img width="310" src="https://raw.githubusercontent.com/onurkerimov/xoid/master/assets/logo.svg" />
</p> 

<p align="center">
  <a href="https://bundlephobia.com/result?p=xoid" >
    <img alt="Bundle Size" src="https://img.shields.io/bundlephobia/min/xoid?label=bundle%20size&style=flat&colorA=4f2eb3&colorB=cb9fff">
  </a>
  <a href="https://www.npmjs.com/package/xoid">
    <img alt="Version" src="https://img.shields.io/npm/v/xoid?style=flat&4f2eb3=293140&colorA=4f2eb3&colorB=cb9fff">
  </a>
  <a href="https://www.npmjs.com/package/xoid">
    <img alt="Downloads" src="https://img.shields.io/npm/dt/xoid.svg?style=flat&colorA=4f2eb3&colorB=cb9fff"/>
  </a>
</p>

**xoid** (pronounced /ˈzoʊ.ɪd/) is a framework-agnostic state management library. **X** in its name denotes its inspiration from great projects such as Redu**X**, Mob**X** and **X**state. It was designed to be simple and scalable. It has extensive Typescript support.

**xoid** is lightweight (1 kB gzipped), but quite powerful. It's composed of building blocks for advanced state management patterns. One of the biggest aims of **xoid** is to unify global state, local component state, and finite state machines in a single API. While doing all these, it also aims to keep itself approachable for newcomers. More features are explained below.


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

<!-- - [Todos (Basic)](https://github.com/onurkerimov/xoid/blob/master/examples/todos-basic) [![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat-square&logo=codesandbox)](https://githubbox.com/onurkerimov/xoid/tree/master/examples/todos-basic) -->

- [Celcius-Fahrenheit conversion](https://github.com/onurkerimov/xoid/blob/master/examples/celcius-fahrenheit) [![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat-square&logo=codesandbox)](https://githubbox.com/onurkerimov/xoid/tree/master/examples/celcius-fahrenheit)

- [Finite state stopwatch](https://github.com/onurkerimov/xoid/blob/master/examples/finite-state-stopwatch) [![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat-square&logo=codesandbox)](https://githubbox.com/onurkerimov/xoid/tree/master/examples/finite-state-stopwatch)

- [Transient update resize observer](https://github.com/onurkerimov/xoid/blob/master/examples/transient-update-resize-observer) [![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat-square&logo=codesandbox)](https://githubbox.com/onurkerimov/xoid/tree/master/examples/transient-update-resize-observer)

- [xoid vs useReducer vs useMethods](https://githubbox.com/onurkerimov/xoid/tree/master/examples/xoid-vs-usereducer-vs-usemethods) [![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat-square&logo=codesandbox)](https://githubbox.com/onurkerimov/xoid/tree/master/examples/xoid-vs-usereducer-vs-usemethods)

<!-- - [Trello clone](https://github.com/onurkerimov/xoid/blob/master/examples/trello) [![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat-square&logo=codesandbox)](https://githubbox.com/onurkerimov/xoid/tree/master/examples/trello) -->


## Quick Tutorial

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

> Type of `alpha` alpha be `Atom<number>`.

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

## More features

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

### Redux Devtools integration

Import `@xoid/devtools` and connect your atom. It will send action names to the Redux Devtools Extension.

```js
import { devtools } from '@xoid/devtools'
import { create, use } from 'xoid'

const atom = create(
  { alpha: 5 }, 
  (atom) => {
    const $alpha = use(atom, s => s.alpha)
    return {
      inc: () => $alpha(s => s + 1),
      resetState: () => atom({ alpha: 5 })
      deeply: {
        nested: {
          action: () => $alpha(5)
        }
      } 
    }
  }
)
const disconnect = devtools(atom, 'myAtom') // second argument specifies the instance name

const { deeply, incrementAlpha } = use(atom) // can work with destructuring
incrementAlpha() // "*.incrementAlpha"
deeply.nested.action() // "*.deeply.nested.action"
use(atom, s => s.alpha)(25)  // "* Update ([timestamp])
```

## Why **xoid**?

- Easy to learn
- Small bundle size
- Framework-agnostic
- Extensive Typescript support
- Easy to work with nested states
- Computed values, transient updates
- Can be used to express finite state machines
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

Thanks to [Anatoly](http://a-maslennikov.com/) for the pencil&ruler icon [#24975](https://www.flaticon.com/free-icon/ruler_245975).

