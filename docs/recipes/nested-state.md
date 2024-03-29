---
id: nested-state
title: Working with nested state
---

Before **xoid**:
```js
setState((state) =>  {
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

After **xoid**:
```js
atom.focus(s => s.deeply.nested.value).update(s => s + 1)
```

**xoid** makes it easier to work with nested state. Redux and React (and **xoid**) are  based on immutable updates. Immutability is great, however it usually has a bad impact on code readability.

To overcome this, there are other tools like **immutablejs** or **immer**. Even Redux Toolkit comes with **immer** by default. Note that using Redux toolkit means adding another ~11kB to your bundle size. This number is ~5kB for **immer** alone. **xoid** is ~1kB, yet it can be used to overcome the same problem.

### Related

To see how **xoid** compares to a classical reducer, and a dedicated library that's using **immer** internally (`use-methods`), you can check the following example:

- [xoid vs useReducer vs useMethods](https://github.com/xoidlabs/xoid/tree/master/examples/xoid-vs-usereducer-vs-usemethods) [![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=flat&colorA=4f2eb3&colorB=4f2eb3&logo=codesandbox)](https://githubbox.com/xoidlabs/xoid/tree/master/examples/xoid-vs-usereducer-vs-usemethods)