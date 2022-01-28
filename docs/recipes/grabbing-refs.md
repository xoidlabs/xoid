---
id: grabbing-refs
title: Grabbing refs
---

`create` function, with no arguments used, can be used to grab element refs (as in React's terminology) *(or other refs, see below)* in a typesafe manner. 

```js
const $ref = create<HTMLElement>() // Atom<HTMLElement | undefined>

$ref(document.body)
```

It's completely safe to feed **xoid** atoms as refs to some React component's `ref` prop.

```js
import { create } from 'xoid'
import { useSetup } from '@xoid/react'
// inside React
const setup = useSetup(() => {
  const ref = create<HTMLDivElement>()
  subscribe(ref, (element) => {
    if(element) console.log(element)
  })
  return {ref}
})
return <div ref={setup.ref} />
```
> This usage won't result in Typescript complaints. Since one of the overloads of a **xoid** atom is `(element: HTMLDivElement) => void`, which is compatible with `React.RefCallback`.

### Grabbing other refs

The term "ref" doesn't need to stop at DOM element references. The same coding style, and thus the same concept can be used to grab events or other things.

```js
const $event = create<MouseEvent>() // Atom<MouseEvent | undefined>
window.addEventListener('mousemove', $event)

// subscribe to the event later
subscribe($event, console.log)
// or perhaps use it to "fork" the event to multiple listeners
subscribe($event, console.warn)
```

