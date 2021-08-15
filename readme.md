<p align="center">
  <img width="300" src="https://raw.githubusercontent.com/onurkerimov/xoid/master/logo.png" />
</p> 

<p align="center">
  <a href="https://bundlephobia.com/result?p=xoid" >
    <img alt="Bundle Size" src="https://img.shields.io/bundlephobia/min/xoid?label=bundle%20size&style=flat&colorA=293140&colorB=293140">
  </a>
  <a href="https://www.npmjs.com/package/xoid">
    <img alt="Version" src="https://img.shields.io/npm/v/xoid?style=flat&colorA=293140&colorB=293140">
  </a>
  <a href="https://www.npmjs.com/package/xoid">
    <img alt="Downloads" src="https://img.shields.io/npm/dt/xoid.svg?style=flat&colorA=293140&colorB=293140"/>
  </a>
</p>

**xoid** is a state-management library with the aim of unifying global state and local component state in a single API. This API has a small surface area and it's composed of building blocks for creating scalable state-management patterns. **X** in its name denotes inspiration from great projects such as Redu**X**, Mob**X** and **X**state. While it was first inspired by **Recoil**, it has become a framework-agnostic state-management solution, with no external dependencies. 

The core package consists of only two exports (`create` and `subscribe`). For React integration, **@xoid/react** is used (`useStore` and `useLocal`). Both packages combined are just **0.8kB** gzipped! Things like computed values, transient updates and async stuff are possible out of the box, without the addition of middlewares or any other library. It has an extensive Typescript support. 


In **xoid**, no selector function is necessary for reaching partial states.

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

| Package        | Exports           |
| ---------| ---------- |
| `xoid` | [`create`](api/create) , [`subscribe`](api/subscribe) |
| `@xoid/react`| [`useStore`](api/usestore) , [`useLocal`](api/uselocal) |
| `@xoid/devtools` | [`devtools`](api/devtools)|

Detailed explanation is in the [documentation website](https://xoid.dev/).

## Usage
**xoid** is based on a simple idea:
```js
import create from 'xoid'
const store = create(3)

store() // 3 (get the value)
store(5) // set the value to 5
store(state => state + 1) // also set the value
store() // 6
```

An **xoid** store is a *lens* () have the same tree structure as the *state*. 
```js
import create from 'xoid'

const store = create({ alpha: 3 })

store.alpha(5) // set the value "surgically"
store(state => ({ ...state, alpha: 5 })) // immutable

const state = store()
console.log(state) // { alpha: 5 }
```

Actions are optionally defined in the second argument of `create` method. Also, you can create derived stores with computed values. To use it with React, just import `useStore` hook. No context providers are necessary.

```js
import x, { use } from 'xoid'
import { useStore } from '@xoid/react'

const NumberModel = x((store) => ({
 increment: store(s => ++s),
 decrement: store(s => --s),
}))

const alpha = NumberModel(3)
const beta = NumberModel(5)
const sum = create((get) => get(alpha) + get(beta))

const App = () => {
  const a = useStore(alpha)
  return <div onClick={use(alpha).increment}>{num}</div>
}
```

### No more selector functions!

Every leaf of the state tree is available on the store tree as well. You can even subscribe to "primitives" like strings, booleans, or numbers.

```js
import { create, useStore } from 'xoid'

const store = create({ name: 'John', surname: 'Doe' })

// in a React component
const [name, setName] = useStore(store.name)
```

### No-API Finite State Machines!
No additional syntax is required to define and use finite state machines. Just use the second callback argument as the state transition function.

```js
import { create, useStore } from 'xoid'

const createMachine = () => {
  const red = { color: '#f00', onClick: () => store(green) }
  const green = { color: '#0f0', onClick: () => store(red) }
  const store = create(red)
  return store
}

// in a React component
const machine = useLocal(createMachine)
const { color, onClick } = useStore(machine)
return <div style={{ color }} onClick={onClick} />
```

### Local state
One of the most important aims of **xoid** is to unify global state and the local component state in a single API. With the **useLocal** hook, you can create on-demand stores that kept around throughout a component's lifecycle. This way, you can keep the component logic truly framework-agnostic.

```js
import { create, useLocal, useStore } from 'xoid'

const AppModel = () => {
  const alpha = NumberModel(3)
  const beta = NumberModel(4)
  const sum = create(get => get(alpha) + get(beta)) 
  return { alpha, beta, sum }
}

// In a React component
const store = useLocal(AppModel)
const { alpha, beta, sum } = useStore(store)
```

## Why **xoid**?

- Easy to learn
- Not limited to React
- Extensive Typescript support
- Small bundle size (1.5 kB gzipped)
- Computed values, transient updates, async stuff
- High performance React apps with fine-grained updates
- Alias or destructure parts of state without losing reactivity

## Thanks
Following awesome projects inspired **xoid** a lot.
- [Recoil](https://github.com/facebookexperimental/Recoil)
- [zustand](https://github.com/pmndrs/zustand)
- [mobx-state-tree](https://github.com/mobxjs/mobx-state-tree)
