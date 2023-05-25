---
id: frameworks
title: Frameworks
---

**xoid** unifies the patterns for global state and local component state. 
As a framework-agnostic tool, it has integrations for React, Vue, and Svelte.

Different UI frameworks have different APIs for local component logic. We can classify local component logic in 4 main sections:
- Reactivity
- Lifecycle
- Dependency Injection
- Other things like template refs

What makes **xoid** special, again, is its isomorphic component lifecycle API. With **xoid**, the following setup function can be consumed by all these three frameworks.


|  | xoid | React | Vue | Svelte |
|---|---|---|---|---|
| State | `create` | `useState` / `useReducer` | `reactive` / `ref` | `readable` / `writable` |
| Derived state | `create` | `useMemo` | `computed` | `derived` |
| Lifecycle | `Adapter["effect"]` | `useEffect` | `onMounted`, `onUnmounted` | `onMount`, `onDestroy` |
| Dependency injection | `Adapter["inject"]` | `createContext`, `useContext` | `provide`, `inject` | `setContext`, `getContext` |


```js
import { Atom, Adapter, InjectionKey } from 'xoid'

export const ThemeSymbol: InjectionKey<{ background: string }> = Symbol()

export const CounterSetup = ($props: Atom<{ initialValue: number }>, adapter: Adapter) => {
  const $counter = $props.map((s) => s.initialValue)

  const { background } = adapter.inject(ThemeSymbol)

  adapter.effect(() => {
    console.log('mounted')
    return () => console.log('unmounted')
  })

  return {
    $counter,
    increment: () => $counter.update((s) => s + 1),
    decrement: () => $counter.update((s) => s - 1),
  }
}
```


It provides integrations for the following frameworks:

### <img src="https://raw.githubusercontent.com/onurkerimov/xoid/master/assets/integrations/react.ico" width="16"/>  React

Just use **@xoid/react** and import `useAtom`. No context providers are needed.

```js
import { useAtom } from '@xoid/react'

// in a React component
const state = useAtom(atom)
```

<details>
  <summary>There's also the "useSetup" hook, for managing local component state with xoid.</summary>

`useSetup` is similar to `React.useMemo` with an empty dependency array. It'll run its callback **only once**.

```js
import { useSetup } from '@xoid/react'

const App = () => {
  const $counter = useSetup(() => create(5))

  ...
}
```

> `useSetup` is guaranteed to be **non-render-causing**. Atoms returned by that should be explicitly subscribed via `useAtom` hook.

An outer value can be supplied as the second argument. It can be used as a reactive atom inside.

```js
import { useSetup } from '@xoid/react'

const App = (props: Props) => {
  const setup = useSetup(($props) => {
    // `$props` has the type: Atom<Props>
    // this way, we can react to `props.something` as it changes
    $props.focus(s => s.something).subscribe(console.log)
  }, props) // <= `props` is supplied here

  ...
}
```
</details>


### <img src="https://raw.githubusercontent.com/onurkerimov/xoid/master/assets/integrations/vue.png" width="16"/> Vue

Just use `@xoid/vue` and import `useAtom`.

```html
<script setup>
import { useAtom } from '@xoid/vue'
import { myAtom } from './my-atom'

const value = useAtom(myAtom)
</script>

<template>
  <div>{{ value }}</div>
</template>
```


### <img src="https://raw.githubusercontent.com/onurkerimov/xoid/master/assets/integrations/svelte.png" width="16"/> Svelte

Svelte integration is seamless, and requires no libraries since every store implements
[Svelte's store contract](https://svelte.dev/docs#component-format-script-4-prefix-stores-with-$-to-access-their-values-store-contract). Just put a `$` before the variable name.

```html
<script>
  import { myAtom } from './my-atom'
</script>

<header>{$myAtom}</header>
```