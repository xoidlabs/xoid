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

**xoid** is an atomic state management library. **X** in its name shows the inspiration it receives from these great projects: Redu**X**, Mob**X** and **X**state. These projects roughly represent different paradigms in state management. **xoid** aims to combine best of these worlds in a very lightweight API. 

In **xoid**, immutable updates (Redux world) and mutable updates (MobX world) are supported. You can create a single store, multiple stores, or even combine them in a nested fashion. Computed values, transient updates and async stuff are supported out of the box, without the addition of middlewares or any other library. 

**xoid** has extensive Typescript support and it has  only 4 exports (`create`, `ref`, `use`, `watch`) For React integration, **@xoid/react** is used. (`useStore` and `useLocal`). Size of both combined is 1.3kB + 0.25kB ~= 1.6 kB!

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
| `xoid` | [`create`](api/create) , [`ref`](api/ref) , [`use`](api/use) , [`watch`](api/watch) |
| `@xoid/react`| [`useStore`](api/usestore) , [`useLocal`](api/uselocal) |
| `@xoid/devtools` | [`devtools`](api/devtools)|

Detailed explanation is in the [documentation website](https://xoid.dev/).

## Usage
**xoid** is based on a simple idea:
```js
import create from 'xoid'

const store = create(3)

store() // 3 (get the value)
store(5) // void (set the value to 5)
store(state => state++) // void (also set the value)
store() // 6
```

*Stores* have the same tree structure as the *state*. 
Both mutable and immutable updates are supported.
```js
import create from 'xoid'

const store = create({ alpha: 3 })

store.alpha(5) // set the value "surgically"
store(state => { state.alpha = 5 }) // mutable
store(state => ({ ...state, alpha: 5 })) // immutable

const state = store()
console.log(state) // { alpha: 5 }
```

Actions are optionally defined in the second argument of `create` method. Also, you can create derived stores with computed values. To use it with React, just import `useStore` hook. No context providers are necessary.

```js
import create, { watch, use } from 'xoid'
import { useStore } from '@xoid/react'

const NumberModel = (number) => create(number, (store) => ({
 increment: store(s => ++s),
 decrement: store(s => --s),
}))

const alpha = NumberModel(3)
const beta = NumberModel(5)
const sum = watch((get) => get(alpha) + get(beta))

const App = () => {
  const [num, { increment }] = useStore(alpha, true)
  return <div onClick={increment}>{num}</div>
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

const machine = () => {
  const red = { color: '#f00', onClick: () => set(green) }
  const green = { color: '#0f0', onClick: () => set(red) }
  const set = create(red)
  return set
}

// in a React component
const { color, onClick } = useStore(machine)
return <div style={{ color }} onClick={onClick} />
```

### Smart subscription

Only the state nodes that are "destructured" will be subscribed to. This means, you don't need to worry about often occuring changes in an unrelated state portion. 

```js
import { create, set } from 'xoid'

const store = create({ alpha: 3, beta: 5 })
setInterval(() => store.beta((count) => ++count, 50)

// In a React component
const { alpha } = useStore(store)
// component will render only once and it's completely isolated from store.beta's changes

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

### Models 
Models are an advanced feature of **xoid**, and they're directly related to `arrayOf` and `objectOf` exports. Here's an example of easy state (de)serialization. (Your plain JSON data comes alive with your pre-defined actions in your model declarations) 

```js
import { create, arrayOf, get, set, use } from 'xoid'

const EmployeeModel = (payload) => create(
  { name: payload.name }, 
  (store) => ({ greet: () => console.log(`Hey ${get(store.name)}!`) })
)

const CompanyModel = (payload) => create({
  name: payload.name,
  employees: arrayOf(EmloyeeModel, payload.employees),
})

// initialize a store using the above models
const companyStore = CompanyModel({
  name: 'my-awesome-company',
  employees: [{ name: 'you' }, { name: 'me' }]
})

use(companyStore.employees[0]).greet() // 'Hey you!'
```

Another benefit of using models are built-in `add` and `remove` actions. These builtin actions have 100% consistent TypeScript types with your model declarations.

```js
use(companyStore.employees).add({ name: 'third employee'})
use(companyStore.employees[2]).greet() // Hey third employee!

use(companyStore.employees).remove(2) // by index
use(companyStore.employees).remove(item => item.name === 'third employee') // by filter function

// if `employees` was an "objectOf(EmployeeModel)"
use(companyStore.employees).add({ name: 'third employee'}, '0000')
use(companyStore.employees).remove('0000') // by key
use(companyStore.employees).remove(item => item.name === 'third employee') // by filter function

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
