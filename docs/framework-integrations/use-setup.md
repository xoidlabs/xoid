---
id: use-setup
title: useSetup
---

`import { useSetup } from '@xoid/react'`

`import { useSetup } from '@xoid/svelte'`

`import { useSetup } from '@xoid/vue'`

## Basic usage

```js
import { atom } from 'xoid'
import { useSetup } from '@xoid/react'

// inside a component
const $num = useSetup(() => atom(5))
```
When a second argument is provided, it'll be available in the callback argument **as a reactive atom**.

```js
import { subscribe, use } from 'xoid'
import { useSetup } from '@xoid/react'

const App = (props: Props) => {
  useSetup(($props) => {// `$props` has the type: Atom<Props>
    $props.focus(s => s.something).subscribe(console.log)
  }, props)
  ...
}
```

## Importance of `useSetup` for React users

While Vue and Svelte chooses a static closure as the component mental model, React chooses a render cycle. Although a render cycle might look like a real closure, it's not. Some people may find it more comfortable, but it brings some difficulties to the table:

- The runtime relies on the call order of hooks. This implies a strict "rules of hooks" to the user.
- The API surface has to increase. There comes hooks like `useCallback`, `useMemo`, `useRef` just to persist variables.

Vue, Svelte, and more other frameworks on the other hand, use a real closure instead of a render cycle. They never need abstractions such as `useCallback`, `useMemo`, `useRef`, nor they need a strict rules of hooks. **xoid** aims to bring the same to React.


```js
import { useSetup } from '@xoid/react'
import { effect } from 'xoid'

const App = (props: Props) => {
  useSetup(() => {
    const callback = () => { ... }

    effect(() => {
      window.addEventListener('resize', callback)
      window.addEventListener('orientationchange', callback)

      return () => {
        window.removeEventListener('resize', callback)
        window.removeEventListener('orientationchange', callback)
      }
    })
  })
  ...
}
```

You can call `effect` multiple times, or conditionally. It'll connect to the same `useEffect` call. 
```js
import { useSetup } from '@xoid/react'
import { effect } from 'xoid'

const App = (props: Props) => {
  useSetup(() => {
    const callback = () => { ... }

    effect(() => {
      window.addEventListener('resize', callback)
      return () => window.removeEventListener('resize', callback)
    })

    effect(() => {
      window.addEventListener('orientationchange', callback)
      return () => window.removeEventListener('orientationchange', callback)
    })
  })
  ...
}
```

Same applies for `inject`.

```js
import { useSetup } from '@xoid/react'
import { inject } from 'xoid'
import { ThemeSymbol } from './some-module'

const App = (props: Props) => {
  useSetup(() => {
    const theme = inject(ThemeSymbol)
    // do something with the theme
  })
  ...
}
```

> `useSetup` is actually more suitable than `React.useMemo` to create values **exactly once**. According to [React docs](https://reactjs.org/docs/hooks-faq.html#how-to-create-expensive-objects-lazily), "You may rely on useMemo as a performance optimization, not as a semantic guarantee. In the future, React may choose to “forget” some previously memoized values and recalculate them on next render, e.g. to free memory for offscreen components.". `useSetup` hook is based on `useRef`, thus it's guaranteed to run the callback exactly **once**.


> Warning: `@xoid/react`'s way of implementing `inject` relies on React internals that *MIGHT* change in the future. This works properly since the React version 16 to the latest version 18 as of now, however if you choose to not use it, we would like to assure you that it has no runtime effect when it's not called. You can see the implementation [here](https://github.com/xoidlabs/xoid/tree/master/packages/react/src/index.tsx). It's known that `react-relay` uses the same internal, and it's even supported by `preact/compat`. So it's likely there to stay, or at least an equivalent mechanism looks like is going to be supported in the next Fiber versions.