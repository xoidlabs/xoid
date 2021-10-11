---
id: async
title: Async Actions
---

## Async actions

Async actions are defined the following way:
```js
const NumberModel = (payload: number) =>
  create(payload, (atom) => {
    const increment = () => atom(s => s + 1)
    const incrementAsync = async () => {
      await delay(2000)
      increment()
    }
    return { increment, incrementAsync }
  })

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const $number = NumberModel(5)
use($number).incrementAsync()
```

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
    (atom) => {
      try {
        const response = await fetch(endpoint, init)
        atom({
          data: response.json(),
          loading: false,
          error: null
        })
      } catch (error) {
        atom({
          data: null,
          loading: false,
          error
        })
      }
    }
  )
```

```js title="./Component.js"
import { RequestModel } from './helpers'
import { useSetup, useAtom } from '@xoid/react'

// inside React
const atom = useSetup(() => RequestModel('/some-address'))
const { data, error, loading } = useAtom(atom)
```

Note that with **xoid**, `RequestModel` is framework agnostic and can be used outside React too.

```js
import { subscribe } from 'xoid'
import { RequestModel } from './helpers'

subscribe(RequestModel('/some-address'), (value) => {
  const { data, error, loading } = value
  console.log({ data, error, loading })
})
```
