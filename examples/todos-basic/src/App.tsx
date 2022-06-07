import React from 'react'
import { create, use } from 'xoid'
import { useAtom } from '@xoid/react'

type TodoType = { title: string; checked: boolean }
type TodoActions = { toggle: () => void; rename: (name: string) => void }

const $todos = create(
  [
    { title: 'groceries', checked: true },
    { title: 'world invasion', checked: false },
  ],
  (atom) => ({
    add: (todo: TodoType) => atom((s) => [...s, todo]),
    getItem: (index: number) => {
      const $todo = use(atom, index)
      return {
        toggle: () => use($todo, 'checked')((s) => !s),
        rename: use($todo, 'title'),
      }
    },
  })
)

const Todo = (props: { data: TodoType; actions: TodoActions }) => {
  const { title, checked } = props.data
  const { toggle, rename } = props.actions
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

export const Todos = () => {
  const todos = useAtom($todos)
  const { add, getItem } = use($todos)
  return (
    <>
      {todos.map((data, id) => (
        <Todo data={data} actions={getItem(id)} key={id} />
      ))}
      <button onClick={() => add({ title: 'unnamed', checked: false })}>+</button>
    </>
  )
}

const App = () => <Todos />
export default App
