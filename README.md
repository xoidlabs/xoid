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

**xoid** is a framework-agnostic state management library. **X** in its name denotes inspiration from great projects such as Redu**X**, Mob**X** and **X**state. It was designed with emphasis on simplicity and scalability. It has extensive Typescript support.

**xoid** is lightweight (1.8 kB gzipped), but quite powerful. Its composed of building blocks for  advanced state managament patterns. One of the biggest aims of **xoid** is to unify global state, local component state, and finite state machines in a single API. While doing all these, it also aims to keep itself simple and approachable enough for newcomers. More features are explained below.



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

- [Todos (Filtered)](https://github.com/onurkerimov/xoid/blob/master/examples/todos-filtered) [![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat-square&logo=codesandbox)](https://githubbox.com/onurkerimov/xoid/tree/master/examples/todos-filtered)

- [Celcius-Fahrenheit conversion](https://github.com/onurkerimov/xoid/blob/master/examples/celcius-fahrenheit) [![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat-square&logo=codesandbox)](https://githubbox.com/onurkerimov/xoid/tree/master/examples/celcius-fahrenheit)

- [Finite state stopwatch](https://github.com/onurkerimov/xoid/blob/master/examples/finite-state-stopwatch) [![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat-square&logo=codesandbox)](https://githubbox.com/onurkerimov/xoid/tree/master/examples/finite-state-stopwatch)

- [Transient update resize observer](https://github.com/onurkerimov/xoid/blob/master/examples/transient-update-resize-observer) [![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat-square&logo=codesandbox)](https://githubbox.com/onurkerimov/xoid/tree/master/examples/transient-update-resize-observer)


- [Trello clone](https://github.com/onurkerimov/xoid/blob/master/examples/trello) [![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat-square&logo=codesandbox)](https://githubbox.com/onurkerimov/xoid/tree/master/examples/trello)


## API Overview

| Section | Exports           |
| - | - |
| Core API | [`create`](docs/api/create.md), [`effect`](docs/api/effect.md), [`subscribe`](docs/api/subscrib.mde) |
| Model API | [`model`](docs/api/model.md), [`arrayOf`](docs/api/arrayof.md), [`objectOf`](docs/api/objectof.md), [`use`](docs/api/use.md) |
| Helper(s) | [`ready`](docs/api/ready.md) |

### Other packages

- `@xoid/react` - **React** integration
- `@xoid/devtools` - **Redux Devtools** integration
- `@xoid/tree` - Tree of observables (experimental)

## Quick Tutorial

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

With `use` function, own actions of an atom can be used.

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

### Derived state

Atoms can be derived from other atoms, if the state is initialized with a function. This API was heavily inspired by **Recoil**.

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

const unsub = subscribe(select(atom, s => s.alpha), console.log)
```
> To cleanup side-effects, a function can be returned in the subscriber function. (Just like `React.useEffect`)

## React integration

**@xoid/react** is based on two hooks. `useAtom` subscribes the component to the observable values. 

```js
import { useAtom } from '@xoid/react'

// in a React component
const state = useAtom(atom.alpha)
```

The other hook is `useSetup`. It's guaranteed to be **non-render-causing**. It's philosophically similar to `React.useMemo`. It runs the callback function only **once**. The difference from `React.useMemo` is that, the second argument is not a dependency array. Instead, it's a slot to **consume an outer (component scope) variable as an atom**.

```js
import { subscribe } from 'xoid'
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

## More features

### Feature: Optics (lenses)

`lens` export either takes an atom, or just a plain object. It's similar to `select`, but surgical changes won't be immutably propagate to root. Instead, the original object will be mutated.
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

### Redux Devtools integration

Just import `@xoid/devtools` and connect your atom. It will send autogenerated action names to the Redux Devtools Extension.

```js
import { AtomModel, initialState } from './some-file'
import { devtools } from '@xoid/devtools'

const atom = AtomModel(initialState)
const disconnect = devtools(atom, 'myAtom') 

use(atom.todos).add({ title: 'untitled' }) // "(*.todos).add"

use(atom.todos[2]).toggle() // "(*.todos.2).toggle"

use(atom).some.deep.action() // "*.some.deep.action"

atom.todos([{ title: 'first todo' }]) // "Update ([timestamp])"

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


## Thanks
Following awesome projects inspired **xoid** a lot.
- [Recoil](https://github.com/facebookexperimental/Recoil)
- [zustand](https://github.com/pmndrs/zustand)
- [mobx-state-tree](https://github.com/mobxjs/mobx-state-tree)

Thanks to [Anatoly](http://a-maslennikov.com/) for the icon [#24975](https://www.flaticon.com/free-icon/ruler_245975).

