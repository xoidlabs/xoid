---
id: use-atom
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
const num = useAtom(numberAtom);

// in a React component
const name = useAtom(personAtom.focus('name'));
```

