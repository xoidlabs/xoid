---
id: local-state
title: Local component state
---

# Unified way for local and global state management in React

**xoid** is a scalable state management library with the aim of unifying global state and local component state in single API. This API has a small surface area and it's composed of low-level building blocks for creating advanced state management patterns. 

In React world, separating logic and UI via custom hooks is already a common practice. However, xoid offers a further possibility. With xoid, you can separate component logic and UI in a truly **framework-agnostic** manner.

xoid is based on atomic stores. While `useStore` hook is used for consuming global **xoid** stores, there's also the `useLocal` hook, which can be used to create stores on-the-fly, inside React components. These stores are kept around throughout a component's lifecycle, and can be cleaned up when the component is unmounted.

## `useApp` (React) vs. `AppModel` (xoid)

To make a comparison between hooks and xoid models, let's consider the following custom React hook. It uses `useState` and `useEffect` hooks internally.

```js
import { useState, useEffect } from 'react'

const useApp = () => {
  const [alpha, setAlpha] = useState(3)
  const [beta, setBeta] = useState(5)
  const [sum, setSum] = useState(alpha + beta)
  useEffect(() => setSum(alpha + beta), [alpha, beta])

  return { alpha, beta, sum, setAlpha, setBeta }  
}
```

Here's the equivalent **xoid** model:

```js
import { create } from 'xoid'

const AppModel = () => {
  const alpha = create(3)
  const beta = create(5)
  const sum = create((get) => get(alpha) + get(beta))

  return create({ alpha, beta, sum })
}
```

Observe that the only import is `create` from xoid. `create` is the main building block of xoid, that's used for creating stores. Our function, `AppModel` is framework-agnostic. It means that it can easily be tested outside React, or perhaps it can be used inside another UI framework in the future. 

Another advantage of xoid is that there's no need to expose `setAlpha` and `setBeta` like in the custom hook. We could have returned them, however we prefered not to. This can be advantageous especially for the cases where there are a lot of state portions to be read and written.

Using `useApp` custom hook in a React component looks like this:

```js
export const App = (props) => {
  const { alpha, beta, sum, setAlpha, setBeta } = useApp()
  return (
    <div>
      {alpha}, 
      {beta}, 
      {sum}
      <button onClick={() => setAlpha(alpha + 1)}>
        increase alpha
      </button>
      <button onClick={() => setBeta(beta + 1)}>
        increase beta
      </button>
    </div>
  )
}
```

whereas consuming `AppModel` model looks like this:

```js
import { set, useLocal, useStore } from 'xoid'

export const App = (props) => {
  const store = useLocal(AppModel)
  const [{alpha, beta, sum}] = useStore(store)

  return (
    <div>
      {alpha}, 
      {beta}, 
      {sum}
      <button onClick={() => set(store.alpha, alpha + 1)}>
        increase alpha
      </button>
      <button onClick={() => set(store.beta, beta + 1)}>
        increase beta
      </button>
    </div>
  )
}
```
In xoid, `useLocal` and `useStore` hooks are usually used in tandem for local component state. `useLocal` creates a local value (once), and `useStore` subscribes the component to it. 
However, they need not to be used consecutively. One may prefer to create a local store in a parent component, and subscribe to that store in a child component. xoid is designed to provide the necessary flexibility for diverse requirements. Similarly, one can decide to consume a local store using a `useEffect` hook, without causing renders in the component.

## Let's spice things up

Now, to increase the difficulty of the stress test, let's assume that `App` is a controlled component, and we need to keep the state in sync with `props.alpha` and `props.beta`. So, usage of the hook should be changed to:

```js
const { alpha, beta, sum, setAlpha, setBeta } = useCustomHook(props)
```

So, we need to modify our custom hook into the following:

```js
import React, { useState, useEffect } from 'react'

const useCustomHook = (props: Props) => {
  const [alpha, setAlpha] = useState(props.alpha)
  useEffect(() => setAlpha(props.alpha), [props.alpha])

  const [beta, setBeta] = useState(props.beta)
  useEffect(() => setBeta(props.beta), [props.beta])

  const [sum, setSum] = useState(alpha + beta)
  useEffect(() => setSum(alpha + beta), [alpha, beta])

  return { alpha, beta, sum, setAlpha, setBeta }  
}
```

In our **xoid** model on the other hand, we can achieve the same functionality by making `alpha` and `beta` into selectors.

```js
import { create } from 'xoid'

const CustomModel = (deps: Store<Props>) => {
  const sum = create((get) => get(deps.alpha) + get(.depsbeta))

  return create({ alpha, beta, sum })
}
```
A lot cleaner. No additional lines.

To use it in a React component, simply add `props` as the second argument:

```js
const store = useLocal(AppModel, props) // <== second arg added
const [{alpha, beta, sum}] = useStore(store)
```

Now, some details on what happened. We added a second argument to `useLocal` hook. When a value is provided in the second argument of `useLocal` hook, it's used to create a local store. Then, across renders, this store's value is kept in sync with the next values.

Even with the addition of this second argument, our closure (`AppModel`) still runs only once. `useLocal` hook, guarantees that the function in its first argument will run only once. 

In `AppModel`, observe that we call it `deps` instead of `props`. Because `deps` is not `props` itself, it's actually a store in sync with `props`. Stores are reactive objects. This makes our closure (`AppModel`) able to respond to changes in `props`, even though it's executed only once.

## Let's add even more stress!

Now, let's assume that we have another requirement. Let's also run some debounced `props.onChange` function when the values of `alpha` and `beta` is modified. Our custom React hook becomes even more complex when we try to meet this requirement. 

```js
import React, { useState, useEffect, useCallback } from 'react'
import { debounce } from "lodash";

const useCustomHook = (props) => {
  const [alpha, setAlpha] = useState(3)
  useEffect(() => setAlpha(props.alpha), [props.alpha])

  const [beta, setBeta] = useState(5)
  useEffect(() => setBeta(props.beta), [props.beta])

  const [sum, setSum] = useState(alpha + beta)
  useEffect(() => setSum(alpha + beta), [alpha, beta])

  const debouncedOnChange = useCallback(
    debounce(props.onChange, 500), 
    [props.onChange]
  )
  useEffect(() => debouncedOnChange(alpha, beta), [alpha, beta])

  return { alpha, beta, sum, setAlpha, setBeta }  
}
```
`useCallback`, an additional hook had to come to the scene.

Meanwhile, in our xoid model, the changes are straightforward:

```js
import { create, get } from 'xoid'
import { debounce } from "lodash";

const AppModel = (deps: Store<Props>) => {
  const sum = create((get) => get(deps.alpha) + get(deps.beta))

  const debouncedOnChange = debounce((a) => get(deps.onChange)(a), 500)
  create((get) => debouncedOnChange(get(alpha), get(beta)))

  return create({ alpha, beta, sum })
}
```

Observe that in `get(deps.onChange)` part, we can use latest version of the `props.onChange`, without having to  use anything similar to `useCallback`, or without specifying the deps in a repetitive way. 

Usage of React hooks for complex logic. brings other state caching related problems, especially in large components that there are too many state variables or props to keep track of as deps of `useCallback`, `usEffect` `useMemo`. 

In react throttle, debounce, setInterval, setTimeout



In addition to all these, with xoid, you have the opportunity to

**xoid** gives a further possibility

### Generalize common `useState` patterns

```js title="./helpers.ts"
import { create } from 'xoid';

export const ToggleSetup = (payload: boolean = false) => {
  const atom = create(payload)
  return [atom, () => atom(s => !s)]
}
```

```js title="./Component.tsx"
import { BooleanModel } from './helpers';
import { useSetup, useAtom } from '@xoid/react';

const [$isModalOpen, toggleModal] = useSetup(ToggleSetup)
const isModalOpen = useAtom($isModalOpen)
```