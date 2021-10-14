---
id: subscribe
title: subscribe
---

`import { subscribe } from 'xoid'`

Subscribes to a **xoid** observable. Takes a listener function as the second argument. Returns an unsubscribe function.

```js
import { create, subscribe } from 'xoid';

const store = create(0);
setInterval(() => store((s) => s + 1), 1000);

const unsubscribe = subscribe(store, (value) => {
  console.log('elapsed seconds: ', value);
});

setTimeout(unsubscribe, 10000);
```

The return value of the listener function can be used for cleaning up side effects.

```js
const unsubscribe = subscribe(store, (value) => {
  causeSideEffects()
  return () => cleanupSideEffects()
});
```
> Calling the returned `unsubscribe` function will also conduct the latest cleanup, if there's one.

It will throw an error when it's applied to non-observable values:

```js
subscribe({}); // throws
```
