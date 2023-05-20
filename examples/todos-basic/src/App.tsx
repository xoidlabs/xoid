import React from 'react'
import { create } from 'xoid'
import { useAtom } from '@xoid/react'

type TodoType = { title: string; checked: boolean }
type TodoActions = { toggle: () => void; rename: (name: string) => void }

const $todos = create(
  [
    { title: 'groceries', checked: true },
    { title: 'world invasion', checked: false },
  ],
  (atom) => ({
    add: (todo: TodoType) => atom.update((s) => [...s, todo]),
    getItem: (index: number) => {
      const $todo = atom.focus(index)
      return {
        toggle: () => $todo.focus('checked').update((s) => !s),
        rename: $todo.focus('title').set,
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
  const [todos, { add, getItem }] = useAtom($todos, true)
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
