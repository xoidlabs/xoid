---
id: useatom
title: useAtom
---

`import { useAtom } from '@xoid/react'`

React hook that's used for consuming an atom. Optional second argument either takes a selector function or a string key.

```js
import { create } from 'xoid';
import { useAtom } from '@xoid/react';

const numberAtom = create(5);
const personAtom = create({ name: 'John', surname: 'Doe' });

// in a React component
const name = useAtom(personAtom, state => state.name);
// same as
const name = useAtom(personAtom, 'name');

// without selector function
const num = useAtom(numberAtom);
```