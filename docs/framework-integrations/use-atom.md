---
id: use-atom
title: useAtom
---

`import { useAtom } from '@xoid/react'`

`import { useAtom } from '@xoid/svelte'`

`import { useAtom } from '@xoid/vue'`


Used for subscribing a component to an atom. 

```js
import { create } from 'xoid';
import { useAtom } from '@xoid/react'; // or '@xoid/vue' or '@xoid/svelte'

const $number = create(5);
const $person = create({ name: 'John', surname: 'Doe' });

// inside a component
const number = useAtom($number);

// inside a component
const name = useAtom($person.focus('name'));
```
