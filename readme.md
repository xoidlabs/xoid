<p align="center">
  <img width="300" src="logo.png" />
</p> 

[![Build Status](https://img.shields.io/github/workflow/status/onurkerimov/xoid/Lint?style=flat&colorA=293140&colorB=293140)](https://github.com/onurkerimov/xoid/actions?query=workflow%3ALint)
[![Build Size](https://img.shields.io/bundlephobia/min/xoid?label=bundle%20size&style=flat&colorA=293140&colorB=293140)](https://bundlephobia.com/result?p=xoid)
[![Version](https://img.shields.io/npm/v/xoid?style=flat&colorA=293140&colorB=293140)](https://www.npmjs.com/package/xoid)
[![Downloads](https://img.shields.io/npm/dt/xoid.svg?style=flat&colorA=293140&colorB=293140)](https://www.npmjs.com/package/xoid)

> **xoid** is a scalable state management library with a small API surface. 
> While learning it takes  ~10 mins, you can still manage great complexity with it.

The xoid package lives in npm. To install, run the following command:


```bash
npm install xoid
```

## Usage

### Intuitive & Familiar API

Provides a similar API to **Recoil**. 
Except, in the second argument of \`createStore\` method, you can specify actions for your store! Also, you can share actions across stores in a modular way.

You can create derived stores with computed values. Derived stores can also receive actions.

```js
import { createStore, set } from 'xoid'

const increment = store => () => set(store, (state) => () => state + 1)
const decrement = store => () => set(store, (state) => () => state - 1)

const alpha = createStore(3, { increment, decrement })
const beta = createStore(4, { increment, decrement })

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
You can even subscribe to primitives like strings or numbers.

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
