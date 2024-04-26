---
id: introduction
title: Introduction
---

**xoid** provides an isomorphic API for **React**, **Vue**, and **Svelte**. If you're using **xoid** with one of these frameworks, simply install one of the following packages:

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs
  defaultValue="React"
  values={[
    {label: 'React', value: 'React'},
    {label: 'Vue', value: 'Vue'},
    {label: 'Svelte', value: 'Svelte'},
  ]}>
  <TabItem value="React">

```bash
npm install @xoid/react
```

  </TabItem>
  <TabItem value="Vue">

```bash
npm install @xoid/vue
```

  </TabItem>
  <TabItem value="Svelte">

```bash
npm install @xoid/svelte
```

  </TabItem>
</Tabs>


> All these framework integration packages have `useAtom` and `useSetup` functions that have the same interface.

## Isomorphic component logic

This might be the most unique feature of **xoid**. With **xoid**, you can write component logic (including lifecycle) ONCE, and run it across multiple frameworks. This feature is for you especially if:
- You're a design system, or a headless UI library maintainer
- You're using multiple frameworks in your project, or refactoring your code from one framework to another
- You dislike React's render cycle and want a simpler, real closure for managing complex state

The following is called a "setup" function:

```js
import { atom, Atom, effect, inject } from 'xoid'
import { ThemeSymbol } from './theme'

export const CounterSetup = ($props: Atom<{ initialValue: number }>) => {
  const { initialValue } = $props.value

  const $counter = atom(initialValue)
  const increment = () => $counter.update((s) => s + 1)
  const decrement = () => $counter.update((s) => s - 1)

  effect(() => {
    console.log('mounted')
    return () => console.log('unmounted')
  })

  const theme = inject(ThemeSymbol)
  console.log("theme is obtained using context:", theme)

  return { $counter, increment, decrement }
}
```
All `@xoid/react`, `@xoid/vue`, and `@xoid/svelte` modules have an isomorphic `useSetup` function that can consume functions like this. 

> We're aware that not all users need this feature, so we've built it tree-shakable. If `useAtom` is all you need, you may choose to import it from `'@xoid/[FRAMEWORK]/useAtom'`. 


With this feature, you can effectively replace the following framework-specific APIs:

|  | <img src="https://raw.githubusercontent.com/xoidlabs/xoid/master/assets/logo-plain.svg" width="16"/> xoid | <img src="https://raw.githubusercontent.com/xoidlabs/xoid/master/assets/integrations/react.ico" width="16"/> React | <img src="https://raw.githubusercontent.com/xoidlabs/xoid/master/assets/integrations/vue.png" width="16"/> Vue | <img src="https://raw.githubusercontent.com/xoidlabs/xoid/master/assets/integrations/svelte.png" width="16"/> Svelte |
|---|---|---|---|---|
| State | `atom` | `useState` / `useReducer` | `reactive` / `ref` | `readable` / `writable` |
| Derived state | `atom` | `useMemo` | `computed` | `derived` |
| Lifecycle | `effect` | `useEffect` | `onMounted`, `onUnmounted` | `onMount`, `onDestroy` |
| Dependency injection | `inject` | `useContext` | `inject` | `getContext` |
