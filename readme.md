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

**xoid** is a framework-agnostic state management library. **X** in its name  denotes inspiration from great projects such as Redu**X**, Mob**X** and **X**state. It was designed with emphasis on simplicity and scalability.  It has extensive Typescript support.

**xoid** is lightweight (1 kB gzipped), but quite powerful. Its composed of building blocks for building advanced state managament patterns. One of the biggest aims of **xoid** is to unify global state, local component state, and finite state machines in a single API. While doing all these, it also aims to keep itself simple and approachable enough for newcomers. More features are explained below, and the [documentation website](https://xoid.dev/).



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
| - | - |
| `xoid` | combines **@xoid/core** and **@xoid/model** |
| `@xoid/core` | [`create`](api/create) , [`subscribe`](api/subscribe) |
| `@xoid/model` | [`model`](api/model) , [`arrayOf`](api/arrayof) , [`objectOf`](api/objectof) , [`use`](api/use)  |
| `@xoid/react`| [`useStore`](api/usestore) , [`useSetup`](api/usesetup) |
<!-- | `@xoid/devtools` | [`devtools`](api/devtools)| -->



## Quick Tutorial

### Store

Stores are standalone setter/getter objects that hold state. `create` function is used to create them.

```js
import { create } from 'xoid'

const store = create(3)
store() // 3 (get the value)
store(5) // void (set the value to 5)
store(state => state + 1) // void (also set the value)
store() // 6
```


In **xoid**, every store is an ES6 Proxy wrapper around the state. This means that no selector function is necessary to "focus" a deep branch of state.

```js
import { create } from 'xoid'

const store = create({ alpha: ['foo', 'bar'], deep: { beta: 5 } })
store.alpha() // ['foo', 'bar']
store.deep.beta() // 5
```


**xoid** is based on immutable updates, so if you "surgically" set state of a focused branch, changes will propagate to the root. This can prevent writing hard-coded reducers.

```js
const previousState = store() // { alpha: ['foo', 'bar'], deep: { beta: 5 } }
store.deep.beta(s => s + 1)

assert(store.deep.beta() === 6) // ✅
assert(previousState !== store()) // ✅
```


### Derived state

For derived state, the same `create` function is used. A derived store has the same properties above. Their API was heavily inspired by **Recoil**.

```js
import { create } from 'xoid'

const alpha = create(3)
const beta = create(5)
// derived store
const sum = create((get) => get(alpha) + get(beta))
```


### React integration

To consume a store by a React component, `useStore` from **@xoid/react** package is used.

```js
import { useStore } from '@xoid/react'

// in a React component
const state = useStore(store.alpha)
```


There's also the `useSetup` hook that can be used to create local state. It's similar to `React.useMemo`, except it's guaranteed to run only **once**.

```js
import { create } from 'xoid'
import { useSetup, useStore } from '@xoid/react'

// in a React component
const setup = useSetup(() => {
  const alpha = create(5)
  return { alpha }
})
// can later be subscribed
const state = useStore(setup.alpha)
```
> `useSetup` is **non-render-causing**. Values returned by that can later be subscribed by the component, or its child components, or they can be kept around to apply side-effects. 

`useSetup` also has an optional second argument to consume variables in the component scope, by converting them into stores and keeping them synced.

```js
import { subscribe } from 'xoid'
import { useSetup } from '@xoid/react'

const App = (props: Props) => {
  const setup = useSetup((deps) => {
    // `deps` has the type: Store<Props>
    subscribe(deps.something, console.log)
  }, props)
}
```

### Subscriptions

For subscription, `subscribe` is used. 

```js
import { subscribe } from 'xoid'

const unsub = subscribe(store.alpha, (state) => {
  console.log(state)
})

// the same function can easily be used inside a React.useEffect
useEffect(() => subscribe(store.alpha, (state) => {
  console.log(state)
}), [])
```


## Advanced concepts

Until this point, `create` and `subscribe` from **xoid**, and `useStore` and `useSetup` from **@xoid/react** are covered.
There are also `model`, `arrayOf`, `objectOf`, and `use` functions, which can be used to associate certain actions with stores.

```js
import { model, use, Store } from 'xoid'

const NumberModel = x((store: Store<number>) => ({ 
  inc: () => store(s => s + 1),
  dec: () => store(s => s - 1) 
}))

const $num = NumberModel(5)
use($num).inc()
$num() // 6
```
Observe that `NumberModel` is a custom `create` function that creates "useable" stores.
If you look at the type of `$num`, it will display as `Store<number> & Useable<{inc: () => void, dec: () => void}>`.

With `arrayOf`, you can create a custom create function that receives an array, and makes sure that every element of it is of the same model type. (there's also `objectOf`)

```js
import { model, arrayOf, use } from 'xoid'
import { NumberModel } from './some-file'

const NumberArrayModel = arrayOf(NumberModel)

const $numArray = NumberArrayModel([1, 3, 5]) // or { a: 1, b: 3, c: 5 }
$numArray.forEach($item => use($item).inc())
console.log($numArray()) // [2, 4, 6]
```

By combining `model`, `arrayOf`, and `objectOf`, much more advanced patterns than "nested reducers" concept in Redux are possible. Plus it's much easier to use. Also note that the same coding style can be used for local component state too.


## Demonstration
> Note that `model` is also exported as the default export, and other exports are keys of it.

```js
import x, { use, Store } from 'xoid'

type TodoType = {
  title: string
  checked: boolean
}

const TodoModel = x((store: Store<TodoType>) => ({
  toggle: () => store.checked((s) => !s),
}))

const TodoListModel = x.arrayOf(TodoModel, (store) => ({
  add: (p: TodoType) => store((s) => [...s, p]),
}))

const store = TodoListModel([
  { title: 'groceries', checked: true },
  { title: 'world invasion', checked: false },
])

use(store).add({ title: 'finish up readme', checked: false })
use(store[2]).toggle() // ✅

// inside React
const { title, checked } = useStore(store[0])
const { toggle } = use(store[0])
```

> It's very cheap to create **xoid** stores. 
> Absolutely **zero** traversal or deep copying occur while `create`, `arrayOf`, `objectOf`, `model` functions run.
> You can easily store complex objects such as DOM elements inside **xoid** stores.
> Association of the store nodes with "useable" actions only occurs once when a node is visited by `use` function.


## Extra features

### Feature: Optics (lenses)

Setting `true` as the second argument of `create` function means "mutable: true". This way, surgical changes won't be immutably propagate to root. Instead, the original object will be mutated.
```js
import { create } from 'xoid'

const obj = { some: { value: 5 } }
const objLens = create(obj, true)
objLens.some.value(512)
console.log(obj) // { some: { value: 512 } }
```


### Feature/pattern: Finite state machines

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


## Why **xoid**?

- Easy to learn
- Small bundle size
- Framework-agnostic
- Extensive Typescript support
- Easy to work with nested states
- Computed values, transient updates
- Can be used as an optics (lenses) library
- No middlewares are required for async stuff
- Can also be used to express finite state machines
- Global state and local component state in the same API


## Thanks
Following awesome projects inspired **xoid** a lot.
- [Recoil](https://github.com/facebookexperimental/Recoil)
- [zustand](https://github.com/pmndrs/zustand)
- [mobx-state-tree](https://github.com/mobxjs/mobx-state-tree)
