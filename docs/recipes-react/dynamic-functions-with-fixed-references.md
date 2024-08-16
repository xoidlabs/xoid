---
id: dynamic-functions-with-fixed-references
title: Dynamic functions with fixed references
---

Inside a React function component, in some cases **a function with a fixed reference, but a dynamic content** may be needed. While this is not as straightforward with React*, it is with **xoid**.

> *: Since this recipe was written, `useEvent` "the missing hook" has been added to React to solve the same problem. However ergonomicity claims of **xoid** still hold.

### Quick Example

Let's imagine, we have the following `React.useEffect`. Inside it, an event listener is attached and removed everytime when `props.number` changes.

```js
useEffect(() => {
  const callback = () => console.log(props.number)
  window.addEventListener('click', callback)
  return () => window.removeEventListener('click', callback)
}, [props.number])
```

Let's assume that, due to changed app requirements, we want to attach the listener only once, and remove it once the component is unmounted. This can be achieved in React way as the following:

```js
// a ref to keep the value
const numberRef = useRef(props.number)
// an effect to update ref's current value when the `props.number` is changed
useEffect(() => (numberRef.current = props.number), [props.number])

// This time useEffect is with an empty dependency array, and it references the ref.
useEffect(() => {
  const callback = () => console.log(numberRef.current)
  window.addEventListener('click', callback)
  return () => window.removeEventListener('click', callback)
}, [])
```

With **xoid**, the equivalent optimization is simply the following:

```js
import { effect } from 'xoid'
import { useSetup } from '@xoid/react'

useSetup(($props) => {
  effect(() => {
    const callback = () => console.log($props.value.number)
    window.addEventListener('click', callback)
    return () => window.removeEventListener('click', callback)
  })
}, props)
```

After getting used to, **xoid** can feel more intuitive than React hooks in a lot of cases.

### Another Example

Let's propose another problem, this time let's examine it in a more concrete scenario.

Let's imagine, inside a React component, we're supposed to initialize a class called `DragDropLibrary` **only once** as `new DragDropLibrary({ onDrop })`. Let's assume we have only one chance to supply `onDrop` to the class instance, and this function cannot be replaced afterwards.

Imagine that `props.func` is our dynamic function that changes in every render, and we're supposed to feed it to `onDrop`.

With **xoid**:
```js
useSetup(($props) => {
  const onDrop = (...args) => $props.value.func(...args)
  new DragDropLibrary({ onDrop })
}, props)
```

> Think of `useSetup` as not a hook, but as something unchanging, some closure that does not ever rerender. **@xoid/react**, in some sense, is a React without hooks.

Without **xoid**: 
```js
const funcRef = useRef((...args) => props.func(...args))
useEffect(() => { funcRef.current = (...args) => props.func(...args) }, [props.func])
useMemo(() => {
  new DragDropLibrary({ onDrop: funcRef.current })
}, [])
```
