---
id: dynamic-functions-with-fixed-references
title: Dynamic functions with fixed references
---
Inside a React function component, in some cases which will be explained below, **a function with a fixed reference, but a dynamic content** may be needed. While it's not as straightforward with React hooks, it's easy to solve with **xoid**.

### Quick Example

In this example, inside a `React.useEffect`, an event listener is attached and removed everytime when `props.number` changes.

```js
//inside React
useEffect(() => {
  const callback = () => console.log(props.number)
  window.addEventListener('click', callback)
  return () => window.removeEventListener('click', callback)
}, [props.number])
```

Let's assume that our requirements somehow led us to attach the listener only once, and remove it only once when the component is unmounted. This could be achieved with React's manners, as the following.

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

> Instead of consuming `props.number` directly, The callback function now consumes `numberRef.current`, so it always has the most recent version of the `number` prop.

With **xoid**, the equivalent optimization is simply the following:

```js
//inside React
useSetup(($props, onCleanup) => {
  const callback = () => console.log($props().number)
  window.addEventListener('click', callback)
  onCleanup(() => window.removeEventListener('click', callback))
}, props)
```

This example is, because it also demonstrates replacing React's lifecycle methods (such as `useEffect`'s unmount using return value) with **xoid**. I wanted to start with this anyway, because it shows the potential of **xoid**.

### Another Example

Let's propose another problem, this time let's examine it in a more detailed way.

Let's imagine that, inside a React component, we're supposed to initialize a class called `DragDropLibrary` **only once** as `new DragDropLibrary({ onDrop })`. Let's assume that this class cannot receive an updated version of `onDrop` callback, because it was not implemented by us, and we have no interest in modifying it. So, we want to perform dynamic "onDrop" actions, with the initial version of `onDrop` that's supplied.

Imagine that `props.func` is our dynamic function that changes in every render. We're going to use it as the source for different "onDrop" actions.

Therefore, we need to convert `props.func` (dynamic reference) into `onDrop` (fixed reference, dynamic content).

With React hooks, it's achieved by combination of three hooks. 
```js
const funcRef = useRef(props.func)
useMemo(() => { funcRef.current = props.func }, [props.func])
const onDrop = useCallback(() => (...args) => funcRef.current(...args), [])
```
- A ref to hold the latest version of `props.func`
- A `useMemo` to update the ref as `props.func` changes
- Finally a `useCallback` with an empty dependencies array

What if I told you, with **xoid**, it's simply:
```js
// inside React
const onDrop = useSetup((atom) => (...args) => atom()(...args), props.func)
```

Let's review what's going on here. Remember that `useSetup` is used to create things **exactly once** inside React components. It's almost similar to `React.useMemo`, but unlike that, it doesn't rerun its callback function when the dependency in the second argument is changed. 

Inside the `useSetup` callback, `atom()` simply means "latest version of the dependency". (Just like how `funcRef.current` would mean the same). Thus, `onDrop` will always call the latest version of the `props.func` inside.

### React vs xoid

Let's try to make React version more user-friendly, by creating a custom hook.

```js
const useLatestCallback = (func) => {
  const funcRef = useRef(func)
  useMemo(() => { funcRef.current = props.func }, [props.func])
  return useCallback(() => (...args) => funcRef.current(...args), [])
}
```

We can then use it as:

```js
const onDrop = useLatestCallback(props.func)
useMemo(() => new DragDropLibrary({ onDrop }),[])
```

It's OK to prefer React hooks. The choice is completely up to you. Just remember that **xoid** provides sensible fundamentals for local state management, and you'll need less custom hooks or helpers.

```js
const onDrop = useSetup((atom) => atom()(), props.func)
useSetup(() => new DragDropLibrary({ onDrop }))
```

