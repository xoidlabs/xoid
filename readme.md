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

> **xoid** is a scalable state management library with small API surface. 
> While learning it takes  ~10 mins, you can still manage great complexity with it.

## Why **xoid**?

- Easy to learn
- Not limited to React
- Extensive Typescript support
- Small bundle size (2.2 kB gzipped)
- Handles deeply nested states perfectly
- Computed values, transient updates, async stuff
- High performance React apps with fine-grained updates
- Alias or destructure parts of state without losing reactivity

To install, run the following command:

```bash
npm install xoid
```

## API Overview

| Exports 	| Description 	|
|-	|-	|
| [`create`](https://xoid.dev/docs/api/create) | Creates a store |
| [`get`](https://xoid.dev/docs/api/get) , [`set`](https://xoid.dev/docs/api/set) , [`use`](https://xoid.dev/docs/api/use) , [`subscribe`](https://xoid.dev/docs/api/subscribe) , [`useStore`](https://xoid.dev/docs/api/usestore) | Interacts with stores |
| [`current`](https://xoid.dev/docs/api/current) , [`arrayOf`](https://xoid.dev/docs/api/arrayof) , [`objectOf`](https://xoid.dev/docs/api/objectof) | Utilities |


## Usage

### Intuitive & Familiar API

Provides a similar API to **Recoil**. 
Except, in the second argument of `create` method, you can specify actions for your store! Also, you can create derived stores with computed values.

```js
import { create, set } from 'xoid'

const numberActions = (store) => ({
 increment: () => set(store, (s) => s + 1),
 decrement: () => set(store, (s) => s - 1)
})
const alpha = create(3, numberActions)
const beta = create(4, numberActions)

// derived state
const sum = create(get => get(alpha) + get(beta))
```

### React & Vanilla

No need for wrapping components into context providers. 
Just import `useStore` and start using! You can also use `use` method to access the actions of a store, without causing rerenders. (it's not a hook)

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

Every store is a *representation* of state, with the same tree structure as the state. 
You can even subscribe to "primitives" like strings or numbers.

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

### Nested Stores 
You can store your application's data as deeply nested structures without worrying about UI performance. While using `useStore` hook, **xoid** never automatically subscribes to child stores.

```js
import { create, set } from 'xoid'

const store = create({ title: 'hello', oftenUpdatingChildStore: create(0) })
setInterval(() => set(store.oftenUpdatingChildStore, (count) => count + 1, 50)

// In a React component
const [state] = useStore(store)
console.log(state.oftenUpdatingChildStore) // component subscribes to the child store only when it's being read.
```

### No-API Finite State Machines!
No additional syntax is required to define and use finite state machines. Just use the second argument of the callback as the state transition function.

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

### Models 
Perhaps, the most powerful feature of **xoid** is this one. Here's an example of easy state (de)serialization. (Your plain JSON data comes alive with your pre-defined actions in your model schemas) 

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

const companyStore = CompanyModel({
  name: 'my-awesome-company',
  employees: [{ name: 'you' }, { name: 'me' }]
})

use(companyStore.employees[0]).greet() // Hey you!
const myName = companyStore.employees[1].name // you can alias stores

console.log(get(myName)) // 'me'
set(myName, 'my new name')
console.log(get(myName)) // 'my new name'
```

Another benefit of using models are builtin `add` and `remove` actions. They are present in the actions by default if a store is created via `arrayOf` or `objectOf` helpers. These builtin actions have 100% consistent TypeScript types with your model schemas.

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

## Thanks
Following awesome projects inspired **xoid** a lot.
- [Recoil](https://github.com/facebookexperimental/Recoil)
- [zustand](https://github.com/pmndrs/zustand)
- [mobx-state-tree](https://github.com/mobxjs/mobx-state-tree)
