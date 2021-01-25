---
id: local-state
title: Local component state
---

### Generalize common `useState` patterns

```js title="./helpers.ts"
import { create, set } from 'xoid';

export const BooleanModel = (payload: boolean = false) =>
  create(payload, (x) => [
    () => set(x, true),
    () => set(x, false)
  ]);
```

```js title="./Component.tsx"
import { BooleanModel } from './helpers';
import { useModel } from 'xoid';

// inside React
const [isOpen, [openList, closeList]] = useModel(BooleanModel)

```

### 

```js title="./Component.tsx"
import { BooleanModel } from './helpers';
import { useModel } from 'xoid';

// inside React
const [uploadStatus, { add, remove, set }] = useModel(() => arrayOf(() => BooleanModel(true)))

type MatrixPayload = VectorPayload[]
type VectorPayload = number[]
const MatrixModel = (payload: MatrixPayload) => arrayOf(VectorModel, payload)
const VectorModel = (payload: VectorPayload) => arrayOf(() => create(0), payload)
```

```js
{map((store) => (
  <Todo store={store} />
))}
```