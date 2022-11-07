---
id: grabbing-refs
title: Grabbing refs
---

A **xoid** atom can be used to grab element refs (as in React's terminology) in a typesafe manner. 

```js
const $ref = create<HTMLElement>() // Stream<HTMLElement>

$ref(document.body)
```

It's completely safe to feed **xoid** atoms as refs to React components as `ref` prop.

```js
import { create } from 'xoid'
import { useSetup } from '@xoid/react'
// inside React
const { ref } = useSetup(() => {
  const $ref = create<HTMLDivElement>()
  subscribe($ref, (element) => console.log(element))
  return { $ref }
})
return <div ref={$ref.set} />
```
> This usage won't result in Typescript complaints. **xoid**'s `set` method in this example, would be compatible with `React.RefCallback`.

### Grabbing events

```js
import { create } from 'xoid'

const $event = create<MouseEvent>() // Stream<MouseEvent>
window.addEventListener('mousemove', $event)

// subscribe to the event later
subscribe($event, console.log)
// or use it to fork the event into multiple listeners
subscribe($event, console.warn)
```