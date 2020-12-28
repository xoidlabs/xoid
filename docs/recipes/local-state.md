---
id: local-state
title: Local component state
---

### Generalize common `useState` patterns

```js title="./helpers.ts"
import { create, set } from 'xoid';

export const BooleanModel = (payload: boolean) =>
  create(payload, (x) => [
    () => set(x, true),
    () => set(x, false)
  ]);
```

```js title="./Component.tsx"
import { useMemo } from 'react';
import { useStore } from 'xoid';
import { BooleanModel } from './helpers';

// inside React
const [isOpen, [openList, closeList]] = useStore(
  useMemo(() => BooleanModel(false), [])
);
```

> Note that [useMemo doesn't guarantee that the callback will run only once](https://reactjs.org/docs/hooks-faq.html#how-to-create-expensive-objects-lazily). You may consider [`use-constant`](https://www.npmjs.com/package/use-constant) package for stricter scenarios.
