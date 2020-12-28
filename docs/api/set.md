---
id: set
title: set
---

`import { set } from 'xoid'`

Sets the value of a store, or a store member. Second argument can either be the new state, or a function that takes the previous state, and returns the new state.

```js
import { create, get, set } from 'xoid';

const store = create({
  alpha: 5,
  deeply: { nested: { value: 'OK' } }
});

console.log(get(store.alpha)); // 5

// Second argument as a function
set(store.alpha, (state) => state + 10); // void

console.log(get(store.alpha)); // 15

// Second argument as value, modifying deeply nested value
set(deeply.nested.value, 'OKAY'); // void

console.log(get(deeply.nested.value)); // 'OKAY'
```

It will throw an error when it's applied to non-store values:

```js
set({}, 'something'); // throws
```
