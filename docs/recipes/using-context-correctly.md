---
id: using-context-correctly
title: Using context correctly
---

Using React context for things such as theme providers, or internationalization is harmless, because those are usually rarely-occuring changes. However, especially in a large-scale apps, context starts to be used for other things, and this can have a bad impact on performance. 

A context provider causes its whole subtree to rerender. This can result in noticable slowdowns. Even Redux has used React Context in v6, then reverted it in v7 due to [some recurring complaints](https://github.com/reduxjs/react-redux/issues/1164). This was also mentioned in [The History and Implementation of React-Redux by Mark Erikson](https://blog.isquaredsoftware.com/2018/11/react-redux-history-implementation/#v7-0).

There's [a great article by Michel Weststrate](https://medium.com/@mweststrate/how-to-safely-use-react-context-b7e343eff076) on using Context efficiently. In summary, the article argues that "we should not store state directly in our context. Instead, we should use context as a dependency injection system". **xoid** can be used to do exactly that.

Let's say that our shared state must have the type `{alpha: number, beta: number}`. Instead of feeding it directly as a context value, we can make it an atom. We can create that atom only once, inside a `useSetup` hook.

```js title="./MyContext.ts"
import { createContext } from 'react'
import { Atom } from 'xoid'

export const MyContext = createContext({} as { atom: Atom<{alpha: number, beta: number}> })
```

```js title="./WrapperComponent.tsx"
import { create } from 'xoid'
import { useSetup } from '@xoid/react'
import { MyContext } from './MyContext'
import { ConsumerComponent } from './ConsumerComponent'

export const WrapperComponent = () => {

  const contextValue = useSetup(() => create({ alpha: 3, beta: 5 }))

  return (
    <MyContext.Provider value={contextValue}>
      <ConsumerComponent />
    </MyContext.Provider>
  )
}
```

```js title="./ConsumerComponent.tsx"
import { useContext } from 'react'
import { useAtom } from '@xoid/react'
import { MyContext } from './MyContext'

export const ConsumerComponent = () => {
  const { atom } = useContext(MyContext)
  const { alpha, beta } = useAtom(atom)

  return (
    <div>
      alpha: {state.alpha}, beta: {state.beta}
      <button onClick={() => select(atom, 'alpha')(s => s + 1)}>increment alpha</button>
    </div>
  )
}
```

Only the components that subscribe to the content of `MyContext` explicitly via `useAtom` will rerender.