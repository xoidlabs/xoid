import React from 'react'
import { use, select, Atom } from 'xoid'
import { decompose, model, arrayOf } from '@xoid/utils'
import { useAtom } from '@xoid/react'

type TodoType = {
  title: string
  checked: boolean
}

const TodoModel = model((atom: Atom<TodoType>) => ({
  toggle: () => select(atom, 'checked')((s) => !s),
  rename: select(props.atom, 'title'),
}))

const StoreModel = arrayOf(TodoModel, (atom) => ({
  add: (todo: TodoType) => atom((s) => [...s, todo]),
}))

const store = StoreModel([
  { title: 'groceries', checked: true },
  { title: 'world invasion', checked: false },
])

export const Todos = () => {
  const atoms = useAtom(store, decompose)
  const { add } = use(store)
  return (
    <>
      {atoms.map((todoAtom, key) => (
        <Todo atom={todoAtom} key={key} />
      ))}
      <button onClick={() => add({ title: 'unnamed', checked: false })}>+</button>
    </>
  )
}

const Todo = (props: { atom: Atom<TodoType> }) => {
  const { title, checked } = useAtom(props.atom)
  const { toggle, rename } = use(props.atom)
  return (
    <div>
      <input type="checkbox" checked={checked} onChange={toggle} />
      <input
        style={{ textDecoration: checked ? 'line-through' : 'none' }}
        value={title}
        onChange={(e) => rename(e.target.value)}
      />
    </div>
  )
}

const App = () => <Todos />
export default App
