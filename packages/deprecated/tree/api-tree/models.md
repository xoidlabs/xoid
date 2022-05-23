This section is incomplete
<!-- ---
id: models
title: Models
---

In **xoid**, there are also `model`, `arrayOf`, `objectOf`, `use` exports, which are members of the Model API. They are used to associate certain actions with stores. 

```js
import { model, use, Store } from 'xoid'

const NumberModel = model((store: Store<number>) => ({
  inc: () => store(s => s + 1),
  dec: () => store(s => s - 1) 
}))

const $num = NumberModel(5)
use($num).inc()
$num() // 6
```
> Observe that `NumberModel` is a custom `create` function that creates "usable" stores.

If you look at the type of `$num`, it will be displayed as `Store<number> & Usable<{inc: () => void, dec: () => void}>`.

With `arrayOf`, you can create a custom create function that receives an array, and makes sure that every element of it is of the same model type. (there's also `objectOf`)

```js
import { model, arrayOf, use } from 'xoid'
import { NumberModel } from './some-file'

const NumberArrayModel = arrayOf(NumberModel)

const $numArray = NumberArrayModel([1, 3, 5])
Object.entries($numArray).forEach([key, $item] => use($item).inc())
console.log($numArray()) // [2, 4, 6]
```

By combining `model`, `arrayOf`, and `objectOf`, much more advanced patterns than "nested reducers" concept in Redux are possible. Note that the same coding style can also be used for local component state.


## Demonstration
> Note that `model` is also exported as the default export, and other exports are keys of it.

```js
import x, { use, Store } from 'xoid'

type TodoType = {
  title: string
  checked: boolean
}

const TodoModel = x((store: Store<TodoType>) => ({
  toggle: () => store.checked((s) => !s),
}))

const TodoListModel = x.arrayOf(TodoModel, (store) => ({
  add: (p: TodoType) => store((s) => [...s, p]),
}))

const StoreModel = x({
  todos: TodoListModel
})

const store = StoreModel({
  boardTitle: 'myTodos',
  todos: [
    { title: 'groceries', checked: true },
    { title: 'world invasion', checked: false },
  ]
})

use(store.todos).add({ title: 'finish up readme', checked: false }) // ✅
use(store.todos[2]).toggle() // ✅

// inside React
const { title, checked } = useStore(store.todos[0])
const { toggle } = use(store.todos[0])
```

> It's very cheap to create **xoid** stores. 
> Absolutely **zero** traversal or deep copying occur while `create`, `arrayOf`, `objectOf`, `model` run.
> You can easily store complex objects such as DOM elements inside **xoid** stores.
> Association of the store nodes with "usable" actions only occurs once when a node is visited by the `use` function.
 -->
