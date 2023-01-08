<p align="center">
  <a href="https://xoid.dev">
    <img width="560" src="https://raw.githubusercontent.com/onurkerimov/xoid/master/assets/logo-full.svg" />
  </a>
</p> 

<p align="center">
  <a href="https://bundlephobia.com/result?p=xoid" >
    <img alt="Bundle Size" src="https://img.shields.io/bundlephobia/min/xoid?label=bundle%20size&style=flat&colorA=4f2eb3&colorB=4f2eb3">
  </a>
  <a href="https://www.npmjs.com/package/xoid">
    <img alt="Version" src="https://img.shields.io/npm/v/xoid?style=flat&4f2eb3=293140&colorA=4f2eb3&colorB=4f2eb3">
  </a>
  <a href="https://www.npmjs.com/package/xoid">
    <img alt="Downloads" src="https://img.shields.io/npm/dt/xoid.svg?style=flat&colorA=4f2eb3&colorB=4f2eb3"/>
  </a>
  <a href="https://xoid.dev">
    <img alt="Netlify" src="https://img.shields.io/netlify/681a364c-45a3-40cf-815d-cd62b15d1f96?style=flat&4f2eb3=293140&colorA=4f2eb3&colorB=4f2eb3">
  </a>
  <a href="https://www.npmjs.com/package/xoid">
    <img alt="License" src="https://img.shields.io/github/license/onurkerimov/xoid?style=flat&4f2eb3=293140&colorA=4f2eb3&colorB=4f2eb3">
  </a>
<!--   <a href="https://bundlephobia.com/result?p=xoid" >
    <img alt="Build" src="https://img.shields.io/github/workflow/status/onurkerimov/xoid/Lint?style=flat&colorA=4f2eb3&colorB=4f2eb3">
  </a> -->
</p>

**xoid** is a framework-agnostic state management library. **X** in its name signifies the inspiration it draws from great projects such as Redu**X**, Mob**X** and **X**state. It was designed to be simple and scalable. It has extensive Typescript support.

**xoid** is lightweight (~1kB gzipped), but quite powerful. It's composed of building blocks for advanced state management patterns. One of the biggest aims of **xoid** is to unify global state, local component state, and finite state machines in a single API. While doing all these, it also aims to keep itself approachable for newcomers. More features are explained below, and the [documentation website](https://xoid.dev).


To install, run the following command:

```bash
npm install xoid
```
or
```bash
yarn add xoid
```


## Examples

- [Counter](https://github.com/onurkerimov/xoid/blob/master/examples/counter) [![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat&colorA=4f2eb3&colorB=4f2eb3&logo=codesandbox)](https://githubbox.com/onurkerimov/xoid/tree/master/examples/counter)

- [Todos (Basic)](https://github.com/onurkerimov/xoid/blob/master/examples/todos-basic) [![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat&colorA=4f2eb3&colorB=4f2eb3&logo=codesandbox)](https://githubbox.com/onurkerimov/xoid/tree/master/examples/todos-basic)

- [Todos (Filtered)](https://github.com/onurkerimov/xoid/blob/master/examples/todos-filtered) [![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat&colorA=4f2eb3&colorB=4f2eb3&logo=codesandbox)](https://githubbox.com/onurkerimov/xoid/tree/master/examples/todos-filtered)

- [Celcius-Fahrenheit conversion](https://github.com/onurkerimov/xoid/blob/master/examples/celcius-fahrenheit) [![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat&colorA=4f2eb3&colorB=4f2eb3&logo=codesandbox)](https://githubbox.com/onurkerimov/xoid/tree/master/examples/celcius-fahrenheit)

- [Finite state stopwatch](https://github.com/onurkerimov/xoid/blob/master/examples/finite-state-stopwatch) [![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat&colorA=4f2eb3&colorB=4f2eb3&logo=codesandbox)](https://githubbox.com/onurkerimov/xoid/tree/master/examples/finite-state-stopwatch)

- [Dots and arrows](https://githubbox.com/onurkerimov/xoid/tree/master/examples/dots-and-arrows) [![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat&colorA=4f2eb3&colorB=4f2eb3&logo=codesandbox)](https://githubbox.com/onurkerimov/xoid/tree/master/examples/dots-and-arrows)

- [Transient update resize observer](https://github.com/onurkerimov/xoid/blob/master/examples/transient-update-resize-observer) [![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat&colorA=4f2eb3&colorB=4f2eb3&logo=codesandbox)](https://githubbox.com/onurkerimov/xoid/tree/master/examples/transient-update-resize-observer)

- [xoid vs useReducer vs useMethods](https://githubbox.com/onurkerimov/xoid/tree/master/examples/xoid-vs-usereducer-vs-usemethods) [![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat&colorA=4f2eb3&colorB=4f2eb3&logo=codesandbox)](https://githubbox.com/onurkerimov/xoid/tree/master/examples/xoid-vs-usereducer-vs-usemethods)

## Quick Tutorial

**xoid** has only one export: `create`. Create is also exported as the default export.

`import { create } from 'xoid'`
`import create from 'xoid'`

### Atom

Atoms are holders of state.

```js
import { create } from 'xoid'

const atom = create(3)
console.log(atom.value) // 3
atom.set(5)
atom.update((state) => state + 1)
console.log(atom.value) // 6
```

Atoms can have actions if the second argument is used.

```js
import { create } from 'xoid'

const numberAtom = create(5, (atom) => ({
  increment: () => atom.update(s => s + 1),
  decrement: () => atom.update(s => s - 1)
}))

numberAtom.actions.increment()
```

There's the `.focus` method, which can be used as a selector/lens. **xoid** is based on immutable updates, so if you "surgically" set state of a focused branch, changes will propagate to the root.

```js
import { create } from 'xoid'

const atom = create({ deeply: { nested: { alpha: 5 } } })
const previousValue = atom.value

// select `.deeply.nested.alpha`
const alpha = atom.focus(s => s.deeply.nested.alpha)
alpha.set(6)

// root state is replaced with new immutable state
assert(atom.value !== previousValue) // ✅
assert(atom.value.deeply.nested.alpha === 6) // ✅
```

### Derived state

Atoms can be derived from other atoms. This API was heavily inspired by **Recoil**.

```js
const alpha = create(3)
const beta = create(5)
// derived atom
const sum = create((get) => get(alpha) + get(beta))
```

Alternatively, `.map` method can be used to quickly derive the state from a single atom.

```js
const alpha = create(3)
// derived atom
const doubleAlpha = alpha.map((s) => s * 2)
```

### Subscriptions

For subscriptions, `subscribe` and `watch` are used. They are the same, except `watch` runs the callback immediately, while `subscribe` waits for the first update after subscription.

```js
const unsub = atom.subscribe(
  (state, previousState) => { console.log(state, previousState) }
)

// later
unsub()
```
> To cleanup side-effects, a function can be returned in the subscriber function. (Just like `React.useEffect`)

### React integration

**@xoid/react** is based on two hooks. `useAtom` subscribes the component to an atom. If a second argument is supplied, it'll be used as a selector function.

```js
import { useAtom } from '@xoid/react'

// in a React component
const state = useAtom(atom)
```

The other hook is `useSetup`. It can be used for creating local component state. It's similar to `React.useMemo` with empty dependencies array. It'll run its callback **only once**.

```js
import { useSetup } from '@xoid/react'

const App = () => {
  const $counter = useSetup(() => create(5))

  ...
}
```

> `useSetup` is guaranteed to be **non-render-causing**. Atoms returned by that should be explicitly subscribed via `useAtom` hook.

An outer value can be supplied as the second argument. It'll turn into a reactive atom.

```js
import { useSetup } from '@xoid/react'

const App = (props: Props) => {
  const setup = useSetup(($props) => {
    // `$props` has the type: Atom<Props>
    // this way, we can react to `props.something` as it changes
    $props.focus(s => s.something).subscribe(console.log)
  }, props)

  ...
}
```

If you've read until here, you have enough knowledge to start using **xoid**. You can refer to the [documentation website](https://xoid.dev) for more.

## More features

### Pattern: Finite state machines

No additional syntax is required for state machines. Just use the good old `create` function.

```js
import { create } from 'xoid'
import { useAtom } from '@xoid/react'

const createMachine = () => {
  const red = { color: '#f00', onClick: () => atom.set(green) }
  const green = { color: '#0f0', onClick: () => atom.set(red) }
  const atom = create(red)
  return atom
}

// in a React component
const { color, onClick } = useAtom(createMachine)
return <div style={{ color }} onClick={onClick} />
```

### Redux Devtools integration

Import `@xoid/devtools` and set a `debugValue` to your atom. It will send values to the Redux Devtools Extension.

```js
import { devtools } from '@xoid/devtools'
import { create, use } from 'xoid'
devtools() // run once

const atom = create(
  { alpha: 5 }, 
  (atom) => {
    const $alpha = atom.focus(s => s.alpha)
    return {
      inc: () => $alpha.update(s => s + 1),
      resetState: () => atom.set({ alpha: 5 })
      deeply: {
        nested: {
          action: () => $alpha.set(5)
        }
      } 
    }
  }
)

atom.debugValue = 'myAtom' // enable watching it by the devtools

const { deeply, incrementAlpha } = atom.actions // destructuring is no problem
incrementAlpha() // logs "(myAtom).incrementAlpha"
deeply.nested.action() // logs "(myAtom).deeply.nested.action"
atom.focus(s => s.alpha).set(25)  // logs "(myAtom) Update ([timestamp])
```

## Why **xoid**?

- Easy to learn
- Small bundle size
- Framework-agnostic
- Extensive Typescript support
- Easy to work with nested states
- Computed values, transient updates
- Can be used to express finite state machines
- No middleware is required for async/generator stuff
- Global state and local component state in the same API

## Other packages

- `@xoid/react` - **React** integration
- `@xoid/devtools` - **Redux Devtools** integration
- `@xoid/lite` - Lighter version with less features
- `@xoid/feature` - A typesafe plugin system oriented in ES6 classes

## Thanks
Following awesome projects inspired **xoid** a lot.
- [Recoil](https://github.com/facebookexperimental/Recoil)
- [zustand](https://github.com/pmndrs/zustand)
- [mobx-state-tree](https://github.com/mobxjs/mobx-state-tree)

Thanks to [Anatoly](http://a-maslennikov.com/) for the pencil&ruler icon [#24975](https://www.flaticon.com/free-icon/ruler_245975).

