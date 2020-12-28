---
id: current
title: current
---

`import { current } from 'xoid'`

**xoid** traps states into ES6 proxies. In some cases, objects trapped inside proxies cannot be directly logged into console, or JSON serialized. On the console they show up as `Proxy{}`.

[`get`](get) method is sufficient for logging primitives, however, for objects, still a proxy is returned by `get`. To overcome this, there's `current`.

`current` recursively converts a store, or a store member to a JavaScript structure. It's named after immer's `current`. It basically generates a deepcopy of particular part of the store. Deepcopying is generally computationally expensive. So, it should be used only when it's absolutely necessary.

```js
import { create, get, current } from 'xoid';

const nestedStore = create({
  deeply: { nested: { value: 'OK' } }
});
console.log(nestedStore); // Proxy{deeply: Proxy{}}
console.log(get(nestedStore)); // {deeply: Proxy{}}
console.log(current(nestedStore)); // {deeply: {nested: {value: 'OK'}}}
```
