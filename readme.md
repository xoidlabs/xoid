<p align="center">
  <img width="300" src="logo.png" />
</p> 

<p align="center">
  <a href="https://github.com/onurkerimov/xoid/actions?query=workflow%3ALint" >
    <img alt="Build Status" src="https://img.shields.io/github/workflow/status/onurkerimov/xoid/Lint?style=flat&colorA=293140&colorB=293140">
  </a>
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

> **xoid** is a scalable state management library with small API surface. 
> While learning it takes  ~10 mins, you can still manage great complexity with it.

## Why **xoid**?

- Plays well with Typescript
- Handles deeply nested states perfectly
- Provides an easy way for (de)serialization
- React Native, Redux Devtools supported
- Data fetching, persisting, testing recipes

To install, run the following command:

```bash
npm install xoid
```

## API Overview

| Exports 	| Description 	|
|-	|-	|
| [`createStore`](store#createstore) , [`createModel`](store#createmodel) 	| Creates stores |
| [`get`](vanilla#get) , [`set`](vanilla#set) , [`use`](vanilla#use) , [`subscribe`](vanilla#subscribe) (vanilla) , [`useStore`](hooks#usestore) (React)| Interacts with stores |
| [`computed`](utils#computed) , [`parent`](utils#parent) , [`config`](utils#config) , [`devtools`](utils#devtools)| Utilities |

## Usage

### Intuitive & Familiar API

Provides a similar API to **Recoil**. 
Except, in the second argument of \`createStore\` method, you can specify actions for your store! Also, you can create derived stores with computed values.

```js
import { createStore, set } from 'xoid'

const numberActions = {
 increment: () => set(store, (state) => state + 1),
 decrement: () => set(store, (state) => state - 1)
}
const alpha = createStore(3, numberActions)
const beta = createStore(4, numberActions)

// derived state
const sum = createStore(get => get(alpha) + get(beta))
```

### React & Vanilla

No need for wrapping components into context providers. 
Just import \`useStore\` and start using! You can also use \`use\` method to access the actions of a store, without causing rerenders. (it's not a hook)

```js
import { useStore, use, subscribe } from 'xoid'

// in a React component
const [number, { increment, decrement }] = useStore(alpha)

// use the actions only, without causing rerender
const { increment, decrement } = use(alpha)

// outside React
const unsubscribe = subscribe(alpha, a => console.log(a))
```

### No more selector functions!

Every store returns a **shape** that's analogous to their state. 
You can even subscribe to "primitives" like strings or numbers.

```js
import { createStore, useStore } from 'xoid'

const store = createStore({ name: 'John', surname: 'Doe' })

// in a React component
const [name, setName] = useStore(store.name)
```

### No more hand-written reducers!

With \`set\` method, you can surgically modify the parts in your state.
This means that you can modify your deeply nested state objects without having to write a lot of code, or without using tools like **immer** or **immutablejs**.

```js
import { createStore, get, set } from 'xoid'

const store = createStore({ deeply: { nested: { foo: 5 } } })
const foo = store.deeply.nested.foo

console.log(get(foo)) // 5

// set the value surgically into the store
set(foo, 25)

console.log(get(store)) // { deeply: { nested: { foo: 25 } } }
```

### No-API Finite State Machines!
No additional syntax is required to define and use finite state machines. Just use the second argument of the callback as the state transition function.

```js
import { createStore, useStore } from 'xoid'

const machine = createStore((get, set) => {
  const red = { color: '#f00', onClick: () => set(green) }
  const green = { color: '#0f0', onClick: () => set(red) }
  return red
})

// in a React component
const [{ color, onClick }] = useStore(machine)
return <div style={{ color }} onClick={onClick}/>
```

### Models 
Perhaps, the most powerful feature of **xoid** is this one. Major benefit of the following pattern is no-config state deserialization. (Your plain JSON data comes alive with your pre-defined actions in your model schemas) 

```js
import { createModel, get, set, use } from 'xoid'

interface Employee {
  name: string
}

interface Company {
  name: string
  employees: Employee[]
}

const EmployeeModel = createModel(
  (payload: Employee) => payload, 
  (store) => {
    greet: () => console.log(`Hey ${name}!`)
  }
)

const CompanyModel = createModel((payload: Company) => ({
  name: payload.name,
  employees: EmployeeModel.array(payload.employees),
}))

const companyStore = CompanyModel({
  name: 'my-awesome-company',
  employees: [
    { name: 'you' },
    { name: 'me' }
  ]
})

use(companyStore.employees[0]).greet() // Hey you!

const myName = companyStore.employees[1].name
console.log(get(myName)) // me
set(myName, 'ME')
console.log(get(myName)) // ME
```

Another benefit of using models are builtin `add` and `remove` actions. They are present in the store actions by default when `Model.array`s or `Model.object`s are created. These builtins have 100% consistent TypeScript types with your model schemas.

```js
use(companyStore.employees).add({ name: 'third employee'})
use(companyStore.employees[2]).greet() // Hey third employee!

// remove by id
use(companyStore.employees).remove(2)
// remove by match
use(companyStore.employees).remove(item => item.name === 'third employee')

// similarly, if `employees` was a EmployeeModel.object
use(companyStore.employees).add({ name: 'third employee'}, '0000')
// remove by key
use(companyStore.employees).remove('0000')
// remove by match
use(companyStore.employees).remove(item => item.name === 'third employee')

```

## Thanks
Following awesome projects inspired **xoid** a lot.
- [Recoil](https://github.com/facebookexperimental/Recoil)
- [zustand](https://github.com/pmndrs/zustand)
- [mobx-state-tree](https://github.com/mobxjs/mobx-state-tree)