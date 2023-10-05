---
id: use-setup
title: useSetup
---

`import { useSetup } from '@xoid/react'`

`import { useSetup } from '@xoid/svelte'`

`import { useSetup } from '@xoid/vue'`

## Basic usage

```js
import { create } from 'xoid'
import { useSetup } from '@xoid/react'

// inside a component
const $num = useSetup(() => create(5))
```

> `useSetup` is actually more suitable than `React.useMemo` to create values **exactly once**. According to [React docs](https://reactjs.org/docs/hooks-faq.html#how-to-create-expensive-objects-lazily), "You may rely on useMemo as a performance optimization, not as a semantic guarantee. In the future, React may choose to “forget” some previously memoized values and recalculate them on next render, e.g. to free memory for offscreen components.". `useSetup` hook is based on `useRef`, thus it's guaranteed to run the callback exactly **once**.

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

TLDR: Mental model of frameworks like Svelte and Vue are clearly advantageous over React, and `useSetup` brings the same to React.

Compared to the other two frameworks, a React component's closure is not a real closure, it's a render cycle. This is a huge footgun, however this is even marketed as a "mental model" with arguments like "these constraints force you to write good code", but we think that it's clear that React hooks are a leaky idea, and they're generating more problems than they try to solve. 

- There should be no need for hooks such as `useCallback`, `useMemo`, `useRef`, or the new `useEvent` ever. Frameworks like Vue or Svelte never needs such abstractions, since they operate in a real closure.
- What would be wrong with being able to call `useContext` or `useEffect` conditionally? React's lack of closure forces the runtime to rely on the hook order, and as a result, developers are losing a lot of flexibility.

### `effect`

With **xoid**, you can call `effect` the way you want. You don't have to worry about calling it conditionally. You can call it mutliple times. It'll connect to the same `useEffect` call. 

```js
import { useSetup } from '@xoid/react'
import { effect } from 'xoid/setup'

const App = (props: Props) => {
  useSetup((_, { effect }) => {
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


```js
import { useSetup } from '@xoid/react'
import { effect } from 'xoid/setup'

const App = (props: Props) => {
  useSetup((_, { effect }) => {
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

### `inject`

Same applies for `inject`. Calling useContext conditionally is possible in React now.

> Warning: `@xoid/react`'s way of implementing `inject` relies on React internals that *MIGHT* change in the future. This works properly since the React version 16 to the latest version 18 as of now, however if you choose to not use it, we would like to assure you that it has no runtime effect when it's not called. You can see the implementation [here](https://github.com/onurkerimov/xoid/tree/master/packages/react/src/index.tsx). The good thing is, it's known that `react-relay` uses the same internal, and it's even supported by `preact/compat`. So it's likely there to stay, or at least an equivalent mechanism is there to stay.

```js
import { useSetup } from '@xoid/react'
import { inject } from 'xoid/setup'
import { ThemeSymbol } from './some-module'

const App = (props: Props) => {
  useSetup((_, adapter) => {
    const theme = inject(ThemeSymbol)
    // do something with the theme
  })
  ...
}
```
