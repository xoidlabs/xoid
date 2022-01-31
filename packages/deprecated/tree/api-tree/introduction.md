---
id: getting-started
title: Getting Started
---

> **xoid** is a scalable state management library with a small API surface.
> While learning it takes ~5 minutes, you can still manage great complexity with it.


## Installation

The **xoid** package lives in <a href="https://www.npmjs.com/get-npm" target="_blank">npm</a>. To install, run the following command:

```shell
npm install xoid
```

Or if you're using <a href="https://classic.yarnpkg.com/en/docs/install/" target="_blank">yarn</a>:

```shell
yarn add xoid
```

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

Until this point, the core API and **@xoid/react** are covered. This was the essential part of the API. More parts are covered in the next section.