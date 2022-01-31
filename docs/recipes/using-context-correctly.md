---
id: using-context-correctly
title: Using context correctly
---

Using React context for rarely-occuring changes such as theme providers, or internationalization is harmless. However, when context starts to be used for other things, it can affect performance badly. 

A context provider causes its whole subtree to rerender. This can result in noticable slowdowns. Even Redux has used React Context in v6, then reverted it in v7 due to [some recurring complaints](https://github.com/reduxjs/react-redux/issues/1164). This was also mentioned in [The History and Implementation of React-Redux by Mark Erikson](https://blog.isquaredsoftware.com/2018/11/react-redux-history-implementation/#v7-0).

There's [an article by Michel Weststrate](https://medium.com/@mweststrate/how-to-safely-use-react-context-b7e343eff076) on using Context efficiently. In summary, the article argues that **"we should not store state directly in our context. Instead, we should use context as a dependency injection system"**. **xoid** can be used to do exactly that.

Let's say, we're going to share a state with the following interface: `{alpha: number, beta: number}`. Instead of feeding it directly as a context value, we can make it an atom. We can create that atom only once, inside a `useSetup` hook.

```js title="./App.tsx"
import { create } from 'xoid'
import { useSetup } from '@xoid/react'
import { MyContext } from './MyContext'
import { ConsumerComponent } from './ConsumerComponent'

export const App = () => {

  const contextValue = useSetup(() => create({ alpha: 3, beta: 5 }))

  return (
    <MyContext.Provider value={contextValue}>
      <ConsumerComponent />
    </MyContext.Provider>
  )
}
```

```js title="./MyComponent.tsx"
import { useContext } from 'react'
import { use } from 'xoid'
import { useAtom } from '@xoid/react'
import { MyContext } from './MyContext'

export const MyComponent = () => {
  const atom = useContext(MyContext)
  const { alpha, beta } = useAtom(atom)

  return (
    <div>
      alpha: {state.alpha}, beta: {state.beta}
      <button onClick={() => use(atom, 'alpha')(s => s + 1)}>increment alpha</button>
    </div>
  )
}
```

Only the components that subscribe to the content of `MyContext` explicitly via `useAtom` will rerender. Also note that, any component now has the chance to subscribe to a subtree/leaf of the same context such that: `useAtom(atom, 'alpha')`. This can greatly improve performance when needed.