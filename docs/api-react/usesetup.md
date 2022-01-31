---
id: usesetup
title: useSetup
---

`import { useSetup } from '@xoid/react'`

This export can be used for creating local state inside a React component. Its most basic usage is to create a value exactly **once**.

```js
import { create } from 'xoid'
import { useSetup } from '@xoid/react'

// inside React
const numberStore = useSetup(() => create(5))
```

> While this usage is similar to `React.useMemo`, `useMemo` **shouldn't** be used to create values only once. According to [React docs](https://reactjs.org/docs/hooks-faq.html#how-to-create-expensive-objects-lazily), "You may rely on useMemo as a performance optimization, not as a semantic guarantee. In the future, React may choose to “forget” some previously memoized values and recalculate them on next render, e.g. to free memory for offscreen components.". `useSetup` hook is based on `useRef`, therefore it's guaranteed to run the callback exactly **once**.

It also has a second argument to **consume an outer variable as a reactive atom**.

```js
import { subscribe, use } from 'xoid'
import { useSetup } from '@xoid/react'

const App = (props: Props) => {
  const setup = useSetup((deps) => {
    // `deps` has the type: Atom<Props>
    subscribe(use(deps, s => s.something), console.log)

    const alpha = create(5)
    return { alpha }
  }, props)
  ...
}
```

Lastly, it has a second callback argument to run things on unmount.

```js
import { useSetup } from '@xoid/react'

const App = (props: Props) => {
  useSetup((_, onCleanup) => {
    document.body.background = 'red'
    onCleanup(() => document.body.background = 'white')
  })
  ...
}
```
