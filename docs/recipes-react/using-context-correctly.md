---
id: using-context-correctly
title: Using context correctly
---

Using React context for rarely-occuring changes such as theme providers, or internationalization is harmless. However, when context starts to be used for other things, it can affect performance badly.

A context provider, whenever its state changes, causes its whole subtree to rerender. This can result in noticable slowdowns. Even Redux has used React Context in v6, then reverted it in v7 due to [some recurring complaints](https://github.com/reduxjs/react-redux/issues/1164). This was also mentioned in [The History and Implementation of React-Redux by Mark Erikson](https://blog.isquaredsoftware.com/2018/11/react-redux-history-implementation/#v7-0).

Ideally, a context provider should cause zero rerenders.

There's [an article by Michel Weststrate](https://medium.com/@mweststrate/how-to-safely-use-react-context-b7e343eff076) on this topic. In the article, he summarizes as **"we should not store state directly in our context. Instead, we should use context as a dependency injection system"**. **xoid** couldn't agree more, and it can be used to do exactly that.

Let our state to be shared via context be `{alpha: number, beta: number}`. Instead of feeding it directly as a context value, we can wrap it inside an atom. We can create that atom only once, inside a `useSetup` hook.

```js title="./App.tsx"
import { atom } from 'xoid'
import { useSetup } from '@xoid/react'
import { MyContext } from './MyContext'
import { ConsumerComponent } from './ConsumerComponent'

export const App = () => {
  const contextValue = useSetup(() => atom({ alpha: 3, beta: 5 }))

  return (
    <MyContext.Provider value={contextValue}>
      <ConsumerComponent />
    </MyContext.Provider>
  )
}
```
> useSetup's callback function will run exactly once, and the context's value reference will remain static, however an atom's internal state is dynamic.

```js title="./MyComponent.tsx"
import { useContext } from 'react'
import { use } from 'xoid'
import { useAtom } from '@xoid/react'
import { MyContext } from './MyContext'

export const MyComponent = () => {
  const a = useContext(MyContext)
  const { alpha, beta } = useAtom(a)

  return (
    <div>
      alpha: {state.alpha}, beta: {state.beta}
      <button onClick={() => a.focus('alpha').update(s => s + 1)}>increment alpha</button>
    </div>
  )
}
```

Only the components that subscribe to the content of `MyContext` explicitly via `useAtom` will rerender. Also note that, any component now has the chance to subscribe to a subtree/leaf of the same context such that: `useAtom(atom.focus('alpha'))`. Context selectors are achieved in a single, expressive API! Voilà!