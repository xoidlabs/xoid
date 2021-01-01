
## Basics

Let's start by creating a simple store.
```js
import { create } from 'xoid'

const fooStore = create(0)
```
We're going to use this store in a React component as following:
```js
import { useStore } from 'xoid'

const Foo = () => {
  const [foo, setFoo] = useStore(fooStore)
  const increase = () => setFoo(foo + 1)
  const decrease = () => setFoo(foo - 1)
  return (
    <div>
      {foo}
      <button onClick={increase}>+</button>
      <button onClick={decrease}>-</button>
    </div>
  )
}

const App = () => <Foo />

```
The component is able to modify the `fooStore`, and it will rerender by it's state updates. No context providers are needed. The experience is similar to `React.useState`, but additionally, the state can be shared other React components too.

The store we have created will show up as: 
![](/docs/assets/*.png)

Let's add intrinsic actions to our store:

```js
import { create, set } from 'xoid'

const fooStore = create(0, (store) => ({
  increase: () => set(store, state => state + 1),
  decrease: () => set(store, state => state - 1),
}))
```