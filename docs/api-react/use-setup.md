---
id: use-setup
title: useSetup
---

`import { useSetup } from '@xoid/react'`

This export can be used for creating local state inside a React component. Its most basic usage looks similar to a `React.useMemo` call. It creates a value exactly **once**.

```js
import { create } from 'xoid'
import { useSetup } from '@xoid/react'

// inside React
const $num = useSetup(() => create(5))
```

> `useSetup` is actually more suitable than `React.useMemo` to create values **exactly once**. According to [React docs](https://reactjs.org/docs/hooks-faq.html#how-to-create-expensive-objects-lazily), "You may rely on useMemo as a performance optimization, not as a semantic guarantee. In the future, React may choose to “forget” some previously memoized values and recalculate them on next render, e.g. to free memory for offscreen components.". `useSetup` hook is based on `useRef`, thus it's guaranteed that the callback will execute exactly **once**.

When a second argument is provided, it'll be available in the callback argument **as a reactive atom**.

```js
import { subscribe, use } from 'xoid'
import { useSetup } from '@xoid/react'

const App = (props: Props) => {
  useSetup(($props) => {// `$props` has the type: Atom<Props>
    subscribe($props.focus(s => s.something), console.log)
  }, props)
  ...
}
```

## React adapter

Second callback argument is the React adapter. It has the following shape:
```js
type ReactAdapter = {
  read: <T>(context: React.Context<T>) => T
  mount: (fn: Function) => void
  unmount: (fn: Function) => void
}
```

### `.mount` and `.unmount`

`.mount` and `.unmount` methods simply connect to a `useEffect` call internally. 

```js
import { useSetup } from '@xoid/react'

const App = (props: Props) => {
  useSetup((_, adapter) => {
    const callback = () => { ... }

    adapter.mount(() => {
      window.addEventListener('resize', callback)
      window.addEventListener('orientationchange', callback)
    })

    adapter.unmount(() => {
      window.removeEventListener('resize', callback)
      window.removeEventListener('orientationchange', callback)
    })
  })
  ...
}
```

Even if you do the following grouping, they'll connect to the same `useEffect` call. You can call as many as React adapter methods as you desire. You can even call them conditionally.
```js
import { useSetup } from '@xoid/react'

const App = (props: Props) => {
  useSetup((_, adapter) => {
    const callback = () => { ... }

    adapter.mount(() => window.addEventListener('resize', callback))
    adapter.unmount(() => window.removeEventListener('resize', callback))

    adapter.mount(() => window.addEventListener('orientationchange', callback))
    adapter.unmount(() => window.removeEventListener('orientationchange', callback))
  })
  ...
}
```

### `.read`

`.read` can be used to read the context conditionally. **There's an important note about the `.read` method.** It's the only experimental feature of `@xoid/react` and relies on React internals. This part of React *MIGHT* change in the future. You can consider the `.read` method unsafe and not use it if your React version is -somehow- not fixed. When it's not used, it has no runtime effect. You can see the implementation [here](https://github.com/onurkerimov/xoid/tree/master/packages/react/src/index.tsx). The good thing is, it's known that `react-relay` uses the same internal, and it's even supported by `preact/compat`.

```js
import { useSetup } from '@xoid/react'
import { ThemeContext } from './some-module'

const App = (props: Props) => {
  useSetup((_, adapter) => {
    const theme = adapter.read(ThemeContext)
    // do something with the theme
  })
  ...
}
```