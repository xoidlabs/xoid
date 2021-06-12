---
id: async
title: Async Actions
---

## Common `fetch` as a model

`fetch` can be abstracted away as a model:

```js title="./helpers.js"
import { create, set } from 'xoid'

export const RequestModel = (endpoint, init) =>
  create(
    {
      data: null,
      loading: true,
      error: null,
    },
    (store) => {
      try {
        const response = await fetch(endpoint, init)
        set(store.data, response.json())
        set(store.loading, false)
      } catch (error) {
        set(store.error, error)
      }
    }
  )
```

```js title="./Component.js"
import { RequestModel } from './helpers'
import { useLocal, useStore } from 'xoid'

// inside React
const store = useLocal(() => RequestModel('/some-address'))
const [{ data, error, loading }] = useStore(store)
```

Of course you could build the same functionality without **xoid**, by using `useState` and `useEffect`. However note that with **xoid**, `RequestModel` is framework agnostic and can be used outside React too:

```js
import { subscribe } from 'xoid'
import { RequestModel } from './helpers'

subscribe(RequestModel('/some-address'), (value) => {
  const { data, error, loading } = value
  console.log({ data, error, loading })
})
```

This also gives the ability to inform the React component transiently, without causing render:

```js
import { subscribe } from 'xoid'
import { RequestModel } from './helpers'

// inside React
useEffect(
  () =>
    subscribe(RequestModel('/some-address'), (value) => {
      const { data, error, loading } = value
      console.log({ data, error, loading })
    }),
  []
)
```

```js
export const someRequestStore = create((set) => request1().then((response) => set(response)))
[a] = useStore(someRequestStore)

const someStaticListStore = create({}, (store) => {
  read: async () => {
    const val = await request1()
    set(store, val)
  }
})

const self = useLocal(() => {
  return create({}, (store, { mount }) => {
    mount(use(someStaticListStore).read)
  })
})
[a] = useStore(someRequestStore)


```

## Async actions
```js
const NumberModel = (payload: number) =>
  create(payload, (store) => {
    const increment = () => set(store, (state) => state + 1)
    const incrementAsync = async () => {
      await delay(2000)
      increment()
    }
    return { increment, incrementAsync }
  })

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
```