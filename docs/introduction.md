---
id: getting-started
title: Getting Started
---

> **xoid** is a scalable state management library with a small API surface.
> While learning it takes ~10 mins, you can still manage great complexity with it.


## Installation

The **xoid** package lives in <a href="https://www.npmjs.com/get-npm" target="_blank">npm</a>. To install, run the following command:

```shell
npm install xoid
```

Or if you're using <a href="https://classic.yarnpkg.com/en/docs/install/" target="_blank">yarn</a>:

```shell
yarn add xoid
```

## Quick Start

**xoid** is based on stores. Stores can be initialized with objects, arrays or primitive values.

```js
import { create } from 'xoid'
export const counter = create(0)
```

Stores can be instantly consumed by React components.

```js
import { useStore } from 'xoid'
const Counter = () => {
  const [count, setCount] = useStore(counter)
  return <div onClick={() => setCount(count + 1)}>{count}</div>
}
```

Stores can also have intrinsic actions. You can specify them in the second argument.

```js
import { create, set } from 'xoid'
export const counter = create(0, (store) => ({
  increment: () => set(store, state => state + 1),
  decrement: () => set(store, state => state - 1),
}))
```

A store with actions can be consumed in a React component as the following.

```js
import { useStore } from 'xoid'
const Counter = () => {
  const [count, { increment, decrement }] = useStore(counter)
  return <div onClick={increment}>{count}</div>
}
```

You can use `use` export, if you want to use actions without causing rerenders. (`use` is not a hook)

```js
import { use } from 'xoid'
const Counter = () => {
  const { increment } = use(counter)
  return <div onClick={increment}>inc!</div>
}
```

Also, you can create derived stores with computed values.

```js
import { create } from 'xoid'
export const countPlusOne = create(get => get(counter) + 1)
```

To subscribe to a specific state portion of an **xoid** store, there's no need for selector functions. 

```js
import { create } from 'xoid'
export const store = create({alpha: 0, beta: 1, deeply: { nested: { value: 2 }}})

const Counter = () => {
  const [value] = useStore(store.deeply.nested.value)
  return <div>{value}</div>
}
```

Only `create`, `set`, `use`, `useStore` exports are covered in this quick start guide. These exports are enough to receive a flux-like experience. There are also `get`, `current`, `subscribe`, `arrayOf`, `objectOf` and `useModel` exports, which you can find more info on the next section, or the [API Reference](api/create) section.
