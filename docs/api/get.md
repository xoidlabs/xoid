---
id: get
title: get
---

`import { get } from 'xoid'`

Gets the value of a store, or a store member.

```js
import { create, get } from 'xoid';

const store = create({
  alpha: 5,
  deeply: { nested: { value: 'OK' } }
});

console.log(store.alpha); // Proxy {}

console.log(get(store.alpha)); // 5

console.log(get(deeply.nested.value)); // 'OK'
```

It will throw an error when it's applied to non-store values:

```js
get({}); // throws
```

**Important: For `console.log` debugging and JSON serialization, please instead use [`current`](current).**
