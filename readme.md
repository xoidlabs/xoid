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

**xoid** is lightweight (1.8 kB gzipped), but quite powerful. Its composed of building blocks for  advanced state managament patterns. One of the biggest aims of **xoid** is to unify global state, local component state, and finite state machines in a single API. While doing all these, it also aims to keep itself simple and approachable enough for newcomers. More features are explained below, and the [documentation website](https://xoid.dev/).



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

Exports of `xoid` can be divided into 3 main sections.

| Section | Exports           | Description |
| - | - | - |
| Core API | [`create`](docs/api/create) , [`effect`](docs/api/effect) , [`subscribe`](docs/api/subscribe) | Most commonly used, lower-level exports |
| Model API | [`model`](docs/api/model) , [`arrayOf`](docs/api/arrayof) , [`objectOf`](docs/api/objectof) , [`use`](docs/api/use) | "Useables" for a flux-like experience |
| Helper(s) | [`ready`](docs/api/ready) | A helper function that's usually used with refs |

### Other packages

| Package        | Exports           | Description |
| - | - | - |
| `@xoid/react`| [`useStore`](docs/api/react/usestore) , [`useSetup`](docs/api/react/usesetup) | **React** integration |
| `@xoid/devtools` | [`devtools`](#redux-devtools-integration) | **Redux Devtools** integration |

> There are also `@xoid/core` and `@xoid/observable` intended for library authors.

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


In **xoid**, via ES6 Proxies, every store is an observable tree. No selector function is necessary to "focus" a deep branch of state.

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

The same `create` function is used for creating derived stores. This API was heavily inspired by **Recoil**.

```js
import { create } from 'xoid'

const alpha = create(3)
const beta = create(5)
// derived store
const sum = create((get) => get(alpha) + get(beta))
```


### React integration

For usage in React, `useStore` from **@xoid/react** package is used.

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
> `useSetup` is guaranteed to be **non-render-causing**. Values returned by that can later be subscribed by the component, or its child components, or can be kept around to apply side-effects. 

`useSetup` has an optional second argument to consume outer variables. In the following example, `deps` will be a store with an internal state that's in sync with the `props` variable.

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

For subscriptions, `subscribe` and `effect` are used. They are almost same, except while `effect` runs the callback immediately, `subscribe` waits for the first change after subscription.

```js
import { subscribe } from 'xoid'

const unsub = subscribe(store.alpha, console.log)
```
> To cleanup side-effects, a function can be returned in the subscriber function. (Similar to `React.useEffect`)

## Model API

Until this point, the core API of `xoid` and **@xoid/react** are covered. There are also `model`, `arrayOf`, `objectOf`, `use` functions, which are part of the Model API. They can be used to associate certain actions with stores.

```js
import { model, use, Store } from 'xoid'

const NumberModel = model((store: Store<number>) => ({ 
  inc: () => store(s => s + 1),
  dec: () => store(s => s - 1) 
}))

const $num = NumberModel(5)
use($num).inc()
$num() // 6
```
> Observe that `NumberModel` is a custom `create` function that creates "useable" stores.
If you look at the type of `$num`, it will be displayed as `Store<number> & Useable<{inc: () => void, dec: () => void}>`.

With `arrayOf`, you can create a custom create function that receives an array, and makes sure that every element of it is of the same model type. (there's also `objectOf`)

```js
import { model, arrayOf, use } from 'xoid'
import { NumberModel } from './some-file'

const NumberArrayModel = arrayOf(NumberModel)

const $numArray = NumberArrayModel([1, 3, 5])
Object.entries($numArray).forEach([key, $item] => use($item).inc())
console.log($numArray()) // [2, 4, 6]
```

By combining `model`, `arrayOf`, and `objectOf`, much more advanced patterns than "nested reducers" concept in Redux are possible. Note that the same coding style can also be used for local component state.


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

const StoreModel = x({
  todos: TodoListModel
})

const store = StoreModel({
  boardTitle: 'myTodos',
  todos: [
    { title: 'groceries', checked: true },
    { title: 'world invasion', checked: false },
  ]
})

use(store.todos).add({ title: 'finish up readme', checked: false }) // ✅
use(store.todos[2]).toggle() // ✅

// inside React
const { title, checked } = useStore(store.todos[0])
const { toggle } = use(store.todos[0])
```

> It's very cheap to create **xoid** stores. 
> Absolutely **zero** traversal or deep copying occur while `create`, `arrayOf`, `objectOf`, `model` run.
> You can easily store complex objects such as DOM elements inside **xoid** stores.
> Association of the store nodes with "useable" actions only occurs once when a node is visited by the `use` function.


## More features

### Feature: Optics (lenses)

Setting the second argument of `create` function as `true` means "mutable: true". This way, surgical changes won't be immutably propagate to root. Instead, the original object will be mutated.
```js
import { create } from 'xoid'

const obj = { some: { value: 5 } }
const objLens = create(obj, true)
objLens.some.value(512)
console.log(obj) // { some: { value: 512 } }
```
> Type of `objLens` would be: `MutableStore<{ some: { value: number } }>`. `MutableStore`s have the same properties with `Store`s. This is only a helper type for extra safety.

### Feature: Using as an alternative to `React.useRef`

In **xoid**, a mutable store can be used to grab refs. Another way to generate mutable stores is using zero arguments when creating stores.
```js
const ref = create<HTMLElement>()
```
> Type of `ref` would be: `MutableStore<HTMLElement | undefined>`

```js
import { create, ready, effect } from 'xoid'
import { useSetup } from '@xoid/react'

// inside React
const setup = useSetup((ref) => {
  const ref = create<HTMLDivElement>()
  return { ref }
})

return <div ref={setup.ref} />
```
> `ready` is a helper function that's usually used with refs. It makes it possible to work with non-existent object addresses, that'll be satisfied later. 

```js
effect($color, ready(ref).style.color)

// is roughly equivalent to

effect($color, (color) => {
  const element = ref()
  if(element) element.style.color = color 
})
```

### Pattern: Finite state machines

No additional syntax is required for state machines. Just use the good old `create` function.

```js
import { create } from 'xoid'
import { useStore } from '@xoid/react'

const createMachine = () => {
  const red = { color: '#f00', onClick: () => store(green) }
  const green = { color: '#0f0', onClick: () => store(red) }
  const store = create(red)
  return store
}

// in a React component
const machine = useSetup(createMachine)
const { color, onClick } = useStore(machine)
return <div style={{ color }} onClick={onClick} />
```

### Redux Devtools integration

Just import `@xoid/devtools` and connect your store. It will send autogenerated action names to the Redux Devtools Extension.

```js
import { StoreModel, initialState } from './some-file'
import { devtools } from '@xoid/devtools'

const store = StoreModel(initialState)
const disconnect = devtools(store, 'myStore') 

use(store.todos).add({ title: 'untitled' }) // "(*.todos).add"

use(store.todos[2]).toggle() // "(*.todos.2).toggle"

use(store).some.deep.action() // "*.some.deep.action"

store.todos([{ title: 'first todo' }]) // "Update ([timestamp])"

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
