---
id: dynamic-functions-with-fixed-references
title: Dynamic functions with fixed references
---
Inside a React function component, sometimes **a function with a fixed reference, but a dynamic content** may be needed. This is a rare case and it's easy to solve with **xoid**, while it's not as straightforward with React hooks.

The dynamic content usually comes from the component props, and the fixed function is usually needed by something that needs to be initialized only once. So, let's imagine we're trying to convert `props.func` (dynamic reference) into `funcFixed` (fixed reference, dynamic content).

With React hooks, it's achieved by combination of three hooks. 
```js
const funcRef = useRef(props.func)
useMemo(() => { funcRef.current = props.func }, [props.func])
const funcFixed = useCallback(() => (...args) => funcRef.current(...args), [])
```
To boil down the React way of thinking:
- A ref to hold the latest version of `props.func`
- A `useMemo` to update the ref as `props.func` changes
- Finally a `useCallback` with an empty dependencies array

With **xoid**, it's simply:
```js
// inside React
const funcFixed = useSetup((atom) => (...args) => atom()(...args), props.func)
```
> `useSetup` can be used to return anything. In this case, it's used to return a function that internally calls `atom()`, thus it'll always use the latest version of the `props.func`.