---
id: dynamic-functions-with-fixed-references
title: Dynamic functions with fixed references
---

Inside a React function component, in some cases which will be explained below, **a function with a fixed reference, but a dynamic content** may be needed. While this is not as straightforward with React hooks, it's trivial with **xoid**.

### Quick Example

Let's imagine, we have the following `React.useEffect`. Inside it, an event listener is attached and removed everytime when `props.number` changes.

```js
//inside React
useEffect(() => {
  const callback = () => console.log(props.number)
  window.addEventListener('click', callback)
  return () => window.removeEventListener('click', callback)
}, [props.number])
```

Let's assume that, due to changed app requirements, we want to attach the listener only once, and remove it once the component is unmounted. This can be achieved in React way as the following:

```js
//inside React
const numberRef = useRef(props.number)
useEffect(() => (numberRef.current = props.number), [props.number])

useEffect(() => {
  const callback = () => console.log(numberRef.current)
  window.addEventListener('click', callback)
  return () => window.removeEventListener('click', callback)
}, [])
```

Let's articulate what just happened here. The `useEffect` is converted run only once during the component lifecycle, so it has zero dependencies. Above that `useEffect`, to get the most recent version of the `number` prop each time the callback runs, a mechanism was built using two hooks: a `useRef` to hold the value and a `useEffect` to keep it up to date. This mechanism, the `useEffect` & `useRef` pair is an unspoken, and somewhat common React pattern.

With **xoid**, the equivalent optimization is simply the following:

```js
// inside React
useSetup(($props, onCleanup) => {
  const callback = () => console.log($props().number)
  window.addEventListener('click', callback)
  onCleanup(() => window.removeEventListener('click', callback))
}, props)
```

Second argument of `useSetup` is a means of communicaton with the outside, which is the component scope. `useSetup`'s closure runs only once, yet we can always reach the latest version of `number` without having to setup a DIY `useRef` & `useEffect` pair. After getting used to, **xoid** can feel more intuitive than React hooks in a lot of cases.

### Another Example

Let's propose another problem, this time let's examine it in a more concrete scenario.

Let's imagine, inside a React component, we're supposed to initialize a class called `DragDropLibrary` **only once** as `new DragDropLibrary({ onDrop })`. Let's assume we have only one chance to supply `onDrop` to the class instance, and this function cannot ve replaced afterwards. The library was not implemented by us, and we have no interest in modifying it to have dynamic options. So, we want to perform dynamic "onDrop" actions, with the initial version of `onDrop` that's supplied.

Imagine that `props.func` is our dynamic function that changes in every render. We're going to use it as the source for different "onDrop" actions.

Therefore, we need to convert `props.func` (dynamic reference) into `onDrop` (fixed reference, dynamic content).

With React hooks, it's achieved by combination of three hooks. 
```js
const onDropRef = useRef((...args) => props.func(...args))
useEffect(() => { onDropRef.current = (...args) => props.func(...args) }, [props.func])
const onDrop = onDropRef.current 
```
- The "unspoken" `useRef` & `useEffect` pair
- Finally a `const onDrop = onDropRef.current` line

What if I told you, with **xoid**, it's simply:

```js
// inside React
const onDrop = useSetup((atom) => (...args) => atom.value(...args), props.func)
```

Inside the `useSetup` callback, `atom()` simply means "latest version of the dependency". `ref.current` as a "latest version" has a more indirect feeling, and requires more code to set up.
