---
id: dynamic-functions-with-fixed-references
title: Dynamic functions with fixed references
---

Inside a React function component, in some cases which will be explained below, **a function with a fixed reference, but a dynamic content** may be needed. While this is not as straightforward with React hooks, it's trivial with **xoid**.

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
useSetup(($props, adapter) => {
  const callback = () => console.log($props.value.number)

  adapter.mount(() => window.addEventListener('click', callback))
  adapter.unmount(() => window.removeEventListener('click', callback))
}, props)
```

After getting used to, **xoid** can feel more intuitive than React hooks in a lot of cases. Here, `$props.value` gives the most recent value of `props`, even though the callback of `useSetup` is ran only once.

### Another Example

Let's propose another problem, this time let's examine it in a more concrete scenario.

Let's imagine, inside a React component, we're supposed to initialize a class called `DragDropLibrary` **only once** as `new DragDropLibrary({ onDrop })`. Let's assume we have only one chance to supply `onDrop` to the class instance, and this function cannot ve replaced afterwards. The library was not implemented by us, and we have no interest in modifying it to have dynamic options.

Imagine that `props.func` is our dynamic function that changes in every render. We're going to use it as the source for different "onDrop" actions.

With **xoid**:
```js
const onDrop = useSetup(($props) => (...args) => $props.func(...args), props)
```

Without **xoid**: 
```js
const onDropRef = useRef((...args) => props.func(...args))
useEffect(() => { onDropRef.current = (...args) => props.func(...args) }, [props.func])
const onDrop = onDropRef.current 
```
