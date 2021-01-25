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

## Quick Introduction

In this quick introduction, only `create`, `set`, `use`, `useStore` exports will be introduced. These exports are enough to receive a flux-like experience from **xoid**. There are also `get` and `subscribe` exports which are mostly used outside React, and `arrayOf` and `objectOf`, which are explained in the "Advanced Usage" section.

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


## Examples

We recommend learning **xoid** through directly diving into examples:

- [Basic Todos](https://github.com/onurkerimov/xoid/blob/master/examples/todos-basic) [![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat-square&logo=codesandbox)](https://githubbox.com/onurkerimov/xoid/tree/master/examples/todos-basic)

- [Counter](https://github.com/onurkerimov/xoid/blob/master/examples/counter) [![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat-square&logo=codesandbox)](https://githubbox.com/onurkerimov/xoid/tree/master/examples/counter)

- [Celcius-Fahrenheit conversion](https://github.com/onurkerimov/xoid/blob/master/examples/celcius-fahrenheit) [![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat-square&logo=codesandbox)](https://githubbox.com/onurkerimov/xoid/tree/master/examples/celcius-fahrenheit)

- [Finite state stopwatch](https://github.com/onurkerimov/xoid/blob/master/examples/finite-state-stopwatch) [![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat-square&logo=codesandbox)](https://githubbox.com/onurkerimov/xoid/tree/master/examples/finite-state-stopwatch)

- [Transient update resize observer](https://github.com/onurkerimov/xoid/blob/master/examples/transient-update-resize-observer) [![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat-square&logo=codesandbox)](https://githubbox.com/onurkerimov/xoid/tree/master/examples/transient-update-resize-observer)


- [Trello clone](https://github.com/onurkerimov/xoid/blob/master/examples/trello) [![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat-square&logo=codesandbox)](https://githubbox.com/onurkerimov/xoid/tree/master/examples/trello)
