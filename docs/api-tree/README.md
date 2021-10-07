This section is incomplete
<!-- 
## Model API

Until this point, the core API of `xoid` and **@xoid/react** are covered. There are also `model`, `arrayOf`, `objectOf`, `use` functions, which are part of the Model API. They can be used to associate certain actions with atoms.

```js
import { model, use, Atom } from 'xoid'

const NumberModel = model((atom: Atom<number>) => ({ 
  inc: () => atom(s => s + 1),
  dec: () => atom(s => s - 1) 
}))

const $num = NumberModel(5)
use($num).inc()
$num() // 6
```
> Observe that `NumberModel` is a custom `create` function that creates "useable" atoms.
If you look at the type of `$num`, it will be displayed as `Atom<number> & Useable<{inc: () => void, dec: () => void}>`.

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
import x, { use, Atom } from 'xoid'

type TodoType = {
  title: string
  checked: boolean
}

const TodoModel = x((atom: Atom<TodoType>) => ({
  toggle: () => atom.checked((s) => !s),
}))

const TodoListModel = x.arrayOf(TodoModel, (atom) => ({
  add: (p: TodoType) => atom((s) => [...s, p]),
}))

const AtomModel = x({
  todos: TodoListModel
})

const atom = AtomModel({
  boardTitle: 'myTodos',
  todos: [
    { title: 'groceries', checked: true },
    { title: 'world invasion', checked: false },
  ]
})

use(atom.todos).add({ title: 'finish up readme', checked: false }) // ✅
use(atom.todos[2]).toggle() // ✅

// inside React
const { title, checked } = useAtom(atom.todos[0])
const { toggle } = use(atom.todos[0])
```

> It's very cheap to create **xoid** atoms. 
> Absolutely **zero** traversal or deep copying occur while `create`, `arrayOf`, `objectOf`, `model` run.
> You can easily atom complex objects such as DOM elements inside **xoid** atoms.
> Association of the atom nodes with "useable" actions only occurs once when a node is visited by the `use` function.

### Feature: Using as an alternative to `React.useRef`

In **xoid**, a mutable atom can be used to grab refs. Another way to generate mutable atoms is using zero arguments when creating atoms.
```js
const ref = create<HTMLElement>()
```
> Type of `ref` would be: `Atom<HTMLElement | undefined>`

```js
import { create, ready, effect } from 'xoid'
import { useSetup } from '@xoid/react'

// inside React
const setup = useSetup(() => {
  const ref = create<HTMLDivElement>()
  return { ref }
})

return <div ref={setup.ref} />
```
> `ready` is a helper function that's usually used with refs. It makes it possible to work with non-existent object addresses, that'll be satisfied later. 

```js
const colorLens = lens(document.body, s => s.style.color)
effect($color, colorLens)

// is roughly equivalent to

effect($color, (color) => {
  const element = ref()
  if(element) element.style.color = color 
})
``` -->
