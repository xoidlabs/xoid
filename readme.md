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

**xoid** is a scalable, React-focused state management library with a small API surface. Its name denotes being small, simple, and borrowing inspiration from Redu**X**, Mob**X** and **X**state. **xoid** is similar to them, but not exactly them. This is what "oid" part stands for, as in "human**oid**".

**xoid** is lightweight (2.2 kB gzipped), but quite powerful. Its composed of fundamental, low-level building blocks that can be used for building complex state managament patterns. One of the biggest aims of **xoid** is unifying global state, local component state, and finite state machines in a single API. While doing all these, it also aims to keep itself simple and approachable enough for newcomers. More features are explained below, and the [documentation website](https://xoid.dev/).

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

| Exports        | Description           |
| ---------| ---------- |
| [`create`](api/create) , [`arrayOf`](api/arrayof) , [`objectOf`](api/objectof)  | Creates a store       |
| [`get`](api/get) , [`set`](api/set) , [`use`](api/use) , [`current`](api/current) , [`subscribe`](api/subscribe) | Interacts with stores |
| [`useStore`](api/usestore) , [`useLocal`](api/uselocal) | React integration |

## Usage


**xoid** is based on atomic stores. To create a store, `create` method is used. Actions are optionally defined in the second argument. Also, you can create derived stores with computed values. To use it with React, just import `useStore` hook. No context providers are necessary.

```js
import { create, set, useStore } from 'xoid'

const NumberModel = (number) => create(number, (store) => ({
 increment: () => set(store, (s) => s + 1),
 decrement: () => set(store, (s) => s - 1)
}))

const alpha = NumberModel(3)
const beta = NumberModel(5)
const sum = create(get => get(alpha) + get(beta))

const App = () => {
  const [num, { increment, decrement }] = useStore(alpha)
  return <div onClick={increment}>{num}</div>
}
```

### No more selector functions!

Every store is a *representation* of state, with the same tree structure as the state. Every leaf of the state tree is available on the store tree.
You can even subscribe to "primitives" like strings, booleans, or numbers.

```js
import { create, useStore } from 'xoid'

const store = create({ name: 'John', surname: 'Doe' })

// in a React component
const [name, setName] = useStore(store.name)
```

### No more hand-written reducers!

With `set` method, you can surgically modify the parts in your state.
This means that you can modify deeply nested values without having to write a lot of code, or without using tools like **immer** or **immutablejs**.

```js
import { create, get, set } from 'xoid'

const store = create({ deeply: { nested: { foo: 5 } } })
const foo = store.deeply.nested.foo

console.log(get(foo)) // 5

// set the value surgically into the store
set(foo, 25)

console.log(get(store)) // { deeply: { nested: { foo: 25 } } }
```

### No-API Finite State Machines!
No additional syntax is required to define and use finite state machines. Just use the second callback argument as the state transition function.

```js
import { create, useStore } from 'xoid'

const machine = create((get, set) => {
  const red = { color: '#f00', onClick: () => set(green) }
  const green = { color: '#0f0', onClick: () => set(red) }
  return red
})

// in a React component
const [{ color, onClick }] = useStore(machine)
return <div style={{ color }} onClick={onClick}/>
```

### Nested data

You can combine your stores in a nested fashion without worrying about UI-performance. Because, when a parent store is subscribed using `useStore` hook, updates in its child stores will not cause re-renders, unless that portion of the state is explicitly mentioned. This is a feature inspired by MobX and can be a huge productivity boost. 

```js
import { create, set } from 'xoid'

const store = create({ title: 'hello', childStore: create(0) })
setInterval(() => set(store.childStore, (count) => count + 1, 50)

// In a React component
const [state] = useStore(store)
console.log(state.childStore) // component subscribes to the child store only when it's being read.
```

### Local state
One of the most important aims of **xoid** is to unify global state and the local component state in a single API. With the **useLocal** hook, you can create on-demand stores that kept around throughout a component's lifecycle. This way, you can keep the component logic truly framework-agnostic.

```js
import { create, useLocal, useStore } from 'xoid'

const AppModel = () => {  
  const alpha = NumberModel(3)
  const beta = NumberModel(4)
  const sum = create(get => get(alpha) + get(beta)) 
}

// In a React component
const store = useLocal(AppModel)
const [{alpha, beta, sum}] = useStore(store)
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
- Small bundle size (2.2 kB gzipped)
- Handles deeply nested states perfectly
- Computed values, transient updates, async stuff
- High performance React apps with fine-grained updates
- Alias or destructure parts of state without losing reactivity

## Thanks
Following awesome projects inspired **xoid** a lot.
- [Recoil](https://github.com/facebookexperimental/Recoil)
- [zustand](https://github.com/pmndrs/zustand)
- [mobx-state-tree](https://github.com/mobxjs/mobx-state-tree)
