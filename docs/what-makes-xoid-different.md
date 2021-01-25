---
id: what-makes-xoid-different
title:  What makes xoid so different?
---

Two major distinguishing features:

- You can have deeply nested data without worrying about performance
- You can pass down "primitive" portions of state, without losing reactivity

### You can have deeply nested data without worrying about performance

- In **xoid**, stores can be combined in a nested fashion. When a React component subscribes to a store, it doesn't automatically subscribe to the child stores inside it. This is an optimization for avoiding unnecessary rerenders in React components. It makes it possible to have nested structures without worrying about UI performance. 

- Not having to normalize state means a lot less cognitive overhead. Because mental representation of your domain is most likely a deeply nested structure, so why not have it embodied in your app's state, as it is? This can be a huge productivity boost.
  
- This feature is recommended, but it's not enforced. There are no best practices here. If you prefer having normalized state, you can always decide not to use this feature by not combining stores in a nested fashion. Then, you'll get a Redux-like experience from **xoid**. 

### You can pass down "primitive" portions of state, without losing reactivity

- This is the most defining feature of **xoid**. To explain this one, some technical information is needed. In the recent years, we're seeing that ES6 proxies are increasingly being used for state management. For instance, in Vue 3 composition API or SolidJS, state can be a "reactive" or "watched" object. However when you destructure a part of state which is a primitive, you'll lose it's reactivity. There's such assymetry, because in JavaScript, primitives, unlike objects, don't have references.

- In **xoid**, there's no assymetry between sharing primitive and non-primitive state portions. Store and state are two separate things with the same tree structure. Store tree has no primitive nodes, even when the state that it mirrors has primitive nodes. You can easily destructure or pass down these so-called "primitive"s, because you'll be actually passing an object that *represents* an address in the real state.

