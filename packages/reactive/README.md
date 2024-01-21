# @xoid/reactive

This library is a thin layer over [xoid](https://xoid.dev) (total bundlesize 1.39 kB gzipped). While **xoid** is an atomic state management library based on immutable updates and explicit subscriptions, this one is based on ES6 proxies. It has a similar experience to **Vue 3 composition API**, or libraries like **Valtio**, **MobX**. 

It has the following exports:

| Export | Description |  |  |
|---|---|---|---|
| `create` | Creates atoms. (Re-export of the same `create` function from **xoid**) |
| `reactive` | Creates reactive proxies |
| `computed` | Creates derived atoms |
| `watch` | Creates side-effect watchers |
| `toAtom` | Gets the corresponding atom from a proxy |
| `toReactive` | Gets the corresponding proxy from an atom |

If you use Vue 3, the exports are basically analogous to the following:

| Export | Similar to (Vue 3 Composition API) |  |  |
|---|---|---|---|
| `create` | `ref` |
| `reactive` | `reactive` |
| `computed` | `computed` |
| `watch` | `watchEffect`|
| `toAtom` | `toRef`|
| `toReactive` | `toReactive`|


### Usage

```js
import { reactive, computed, watch, toRef, toReactive } from '@xoid/reactive'

// Create a reactive object
const data = reactive({
  count: 0,
  greeting: 'Hello World!'
})

// Create a derived atom that automatically subscribe to data.count
const $doubleCount = computed(() => data.count * 2)

// There's one atom corresponding to a reactive proxy, and vice versa
assert(data === toReactive(toAtom(data))) // ✅

// Watch for changes in data
watch(() => {
  console.log(`Counter changed: ${data.count}`)
})

// Mutate the data freely
data.count++
```

**xoid** and **@xoid/reactive** libraries are interoperable. They export the same `create` function. The `.value` getter of an atom created by **xoid** package would also auto-subscribe when using `watch`, or `computed`

```js
import { create } from 'xoid'
import { computed } from '@xoid/reactive'

const $count = create(0)

const $doubleCount = computed(() => data.count * 2)
```