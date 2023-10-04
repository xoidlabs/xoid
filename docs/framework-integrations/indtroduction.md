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

**xoid** takes component logic seriously. 
You can - *but don't have to* - write serious component logic with it. The following *setup function* can run across multiple frameworks.

```js
import create, { Atom, Adapter } from 'xoid'
import { ThemeSymbol } from './theme'

export const CounterSetup = ($props: Atom<{ initialValue: number }>, adapter: Adapter) => {
  const { initialValue } = $props.value

  const $counter = create(initialValue)
  const increment = () => $counter.update((s) => s + 1)
  const decrement = () => $counter.update((s) => s - 1)

  adapter.effect(() => {
    console.log('mounted')
    return () => console.log('unmounted')
  })

  const theme = adapter.inject(ThemeSymbol)
  console.log("theme is obtained using context:", theme)

  return { $counter, increment, decrement }
}
```

All `@xoid/react`, `@xoid/vue`, and `@xoid/svelte` modules have an isomorphic `useSetup` function that can consume functions like above. With **xoid**, you can effectively replace the following framework-specific APIs:

|  | <img src="https://raw.githubusercontent.com/onurkerimov/xoid/master/assets/logo-plain.svg" width="16"/> xoid | <img src="https://raw.githubusercontent.com/onurkerimov/xoid/master/assets/integrations/react.ico" width="16"/> React | <img src="https://raw.githubusercontent.com/onurkerimov/xoid/master/assets/integrations/vue.png" width="16"/> Vue | <img src="https://raw.githubusercontent.com/onurkerimov/xoid/master/assets/integrations/svelte.png" width="16"/> Svelte |
|---|---|---|---|---|
| State | `create` | `useState` / `useReducer` | `reactive` / `ref` | `readable` / `writable` |
| Derived state | `create` | `useMemo` | `computed` | `derived` |
| Lifecycle | `Adapter["effect"]` | `useEffect` | `onMounted`, `onUnmounted` | `onMount`, `onDestroy` |
| Dependency injection | `Adapter["inject"]` | `useContext` | `inject` | `getContext` |

> **✨ Opinionated comment ✨**
>
> If you're using `@xoid/react`, you won't ever need hooks like **useMemo**, **useCallback**, **useRef**, or **useEvent**. **xoid**'s mental model of component logic, just like Vue and Svelte, is a static closure instead of a render function. From a static closure's perspective, most hooks are complete bloat. Bringing this kind of component mental model to React was one of the first reasons behind **xoid**'s existence.