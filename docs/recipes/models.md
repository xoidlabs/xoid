---
id: models
title: Composing stores using models
---

In **xoid**, models are the recommended way of creating stores. Usually, a store is composed of conceptually separable entities. Models can be thought as the formal way of declaring those entities. For instance, in a basic kanban board app, main entities would be **the board**, **columns** and **cards**. In the store, we can define and use `BoardModel`, `ColumnModel` and `CardModel`.

:::note info

A model is a function that gets a JavaScript value, and returns a store.

```js
const NumberModel = (payload: number) =>
  create(payload, (store) => ({
    increment: () => set(store, (state) => state + 1),
    decrement: () => set(store, (state) => state - 1)
  }));
```

:::

### Using [`arrayOf`](arrayof) and [`objectOf`](objectof)

Models are often used with these helper functions. Both take a model in the first argument. `arrayOf` creates an array store, and `objectOf` creates an object store. The special thing is that, each key of the resulting store becomes a store of the specified model type.

```js
const numbers = arrayOf(NumberModel, [100, 200, 300]);

use(numbers[1]).increase(); // void
console.log(get(numbers[1])); // 201
```

Also, whenever a state update occurs on this store, it will ensure that any additional key will be of the same store type that's specified in the model:

```js
// state update
set(numbers, (state) => [...state, 5000, 6000]);

use(numbers[4]).increase(); // void
console.log(get(numbers[4])); // 6001 (works!)
```

### A recommended practice

Models that can be used with `arrayOf` and `objectOf` has some extra rules. Violating these rules **won't** be captured by a runtime check. So, for better developer experience, TypeScript is recommended.

- The model should have exactly one payload argument
- This payload should be a pure JavaScript object, i.e. it can be any primitive, object or array, however it shouldn't include stores or store members.
- Resulting store's pure shape (that's obtained by `get`) should match the payload in terms of structure.

```js
type Model<T, Actions> = (payload: Pure<T>) => Store<T, Actions>;
```

### Examples to correct and incorrect models

:::tip correct

- Payload is pure.
- Return value has a substore, but its pure value matches payload's shape.

```js
import { create, set } from 'xoid';

const NumbersModel = (payload: { alpha: number, beta: number }) =>
  create({
    alpha: payload.alpha,
    beta: create(payload.beta)
  });
```

:::

`NumbersModel` can be used as `objectOf(NumbersModel)` or `arrayOf(NumbersModel)`.

:::danger incorrect
Purified shape of payload doesn't match the return value. There's extra `sum` key.

```js
const ABModel = (payload: { alpha: number, beta: number }) =>
  create({
    alpha: payload.alpha,
    beta: payload.beta,
    sum: payload.alpha + payload.beta
  });
```

:::

:::danger incorrect
Payload has an impure value. (`alpha`)

```js
const ABModel = (payload: {
  alpha: ReturnType<typeof NumberModel>,
  beta: number
}) =>
  create({
    alpha: payload.alpha,
    beta: payload.beta
  });
```

:::

Calling `ABModel({alpha: number, beta: number})` would create a store without problems. However trying to use this model with `objectOf` or `arrayOf` results in a typecheck error.

### One nice thing about models

Stores created with `objectOf` or `arrayOf` will have two actions called `add` and `remove` by default. Their usage is documented under [`objectOf`](api/objectOf) and [`arrayOf`](api/arrayOf) titles in API section. 

```js
const TodoModel = (payload: TodoPayload) =>
  create(payload, (store) => ({ toggle: () => set(store.checked, (s) => !s) }))

const todosArray = arrayOf(TodoModel, [
  { title: 'groceries', checked: true },
  { title: 'world invasion', checked: false },
])

const todosObject = objectOf(TodoModel, {
  'uuid-aaaa': { title: 'groceries', checked: true },
  'uuid-bbbb': { title: 'world invasion', checked: false },
})

use(todosArray).add({ title: 'third todo', checked: false })
use(todosObject).add({ title: 'third todo', checked: false }, 'uuid-cccc')

use(todosArray).remove(2) // by index
use(todosObject).remove('uuid-bbbb') // by key
