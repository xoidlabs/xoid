---
id: dynamic-functions-with-fixed-references
title: Dynamic functions with fixed references
---
Inside a React function component, sometimes **a function with a fixed reference, but a dynamic content** may be needed. It's an easy case to solve with **xoid**, while it's not as straightforward with React hooks.

The dynamic content usually comes from the component props, and the fixed function is usually needed by something that needs to be initialized only once. So, let's imagine we're trying to convert `props.func` (dynamic reference) into `funcFixed` (fixed reference, dynamic content).

With React hooks, it's achieved by combination of three hooks. 
```js
const funcRef = useRef(props.func)
useMemo(() => { funcRef.current = props.func }, [props.func])
const funcFixed = useCallback(() => (...args) => funcRef.current(...args), [])
```
- A ref to hold the latest version of `props.func`
- A `useMemo` to update the ref as `props.func` changes
- Finally a `useCallback` with an empty dependencies array

With **xoid**, it's simply:
```js
// inside React
const funcFixed = useSetup((atom) => (...args) => atom()(...args), props.func)
```
> `useSetup` can be used to return anything. In this case, it was used to return a function that internally calls `atom()`, thus it'll always use the latest version of the `props.func`.

### A more concrete example

Take the following `React.useEffect` callback. A window event listener is attached and removed everytime when `props.number` changes.

```js
//inside React
useEffect(() => {
  const callback = () => console.log(props.number)
  window.addEventListener('click', callback)
  return () => window.removeEventListener('click', callback)
}, [props.number])
```

Perhaps we want to attach the listener only once, and remove it only once when the component is unmounted. This could be achieved with React's manners, as the following.

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
