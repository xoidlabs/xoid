---
id: subscribe
title: subscribe
---

`import { subscribe } from 'xoid'`

Subscribes to a store, or a store member. Returns an unsubscribe function.

```js
import { create, set, subscribe } from 'xoid';

const store = create(0);
setInterval(() => set(store, (s) => s + 1), 1000);

const unsubscribe = subscribe(store, (value) => {
  console.log('elapsed seconds: ', value);
});

setTimeout(unsubscribe, 10000);
```

It will throw an error when it's applied to non-store values:

```js
subscribe({}); // throws
```
