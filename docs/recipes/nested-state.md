---
id: nested-state
title: Working with nested state
---

**xoid** makes it easier to work with nested state. Redux and React are both based on immutable updates. Immutability is great, but it can easily "reduce" developer experience. (See? 🤣) One of the most significant by-products of immutable updates is the excessive usage of the spread operator to copy objects and arrays.

Here's a typical nested state update that you can stumble into in a React component or a Redux reducer.

```js
const updateValue = () => setState((state) =>  {
  ...state, 
  deeply: {
    ...state.deeply,
    nested: {
      ...state.deeply.nested,
      value: state.deeply.nested.value + 1
    }
  }
})
```

Writing this is effortful, it's easy to make mistakes, and reading it is painful. To overcome this, tools like **immutablejs** or **immer** is being used. Even Redux Toolkit comes with **immer** by default. Note that using Redux toolkit means adding another ~11kB to your bundle size. This number is ~5kB for **immer** alone.

With its `use` function, **xoid** (~1kB) doesn't require any additional library to simplify nested updates. The following is simply equivalent to the above example:

```js
use(atom, s => s.deeply.nested.value)(s => s + 1)
```

### Advanced example

To see how **xoid** compares to a classical reducer, and a dedicated library that's using **immer** internally, you can check the following example:

- [xoid vs useReducer vs useMethods](https://github.com/onurkerimov/xoid/tree/master/examples/xoid-vs-usereducer-vs-usemethods) [![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat&colorA=4f2eb3&colorB=4f2eb3&logo=codesandbox)](https://githubbox.com/onurkerimov/xoid/tree/master/examples/xoid-vs-usereducer-vs-usemethods)