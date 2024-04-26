---
id: grabbing-refs
title: Grabbing refs
---

A **xoid** atom can be used to grab element refs (as in React's terminology) in a typesafe manner. 

```js
const $ref = atom<HTMLElement>() // Stream<HTMLElement>

$ref.set(document.body)
```

It's completely safe to feed `atom.set` calls as refs to React components as `ref` prop.

```js
import { atom } from 'xoid'
import { useSetup } from '@xoid/react'
// inside React
const { $ref } = useSetup(() => {
  const $ref = atom<HTMLDivElement>()
  $ref.subscribe((element) => console.log(element))
  return { $ref }
})
return <div ref={$ref.set} />
```
> This usage won't result in Typescript complaints. **xoid**'s `set` method in this example, would be compatible with `React.RefCallback`.
