import React from 'react'
import { atom } from 'xoid'
import { useAtom } from '@xoid/react'

type TodoType = { title: string; checked: boolean }
type TodoActions = { toggle: () => void; rename: (name: string) => void }

const $todos = atom(
  [
    { title: 'groceries', checked: true },
    { title: 'world invasion', checked: false },
  ],
  (a) => ({
    add: (todo: TodoType) => a.update((s) => [...s, todo]),
    getItem: (index: number) => {
      const $todo = a.focus(index)
      return {
        toggle: () => $todo.focus('checked').update((s) => !s),
        rename: $todo.focus('title').set,
      }
    },
  })
)

const $hideChecked = atom(false)

const $filteredTodos = atom((get) => {
  const hideChecked = get($hideChecked)
  const todos = get($todos)
  if (hideChecked) return todos.filter((item) => !item.checked)
  return todos
})

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
  const hideChecked = useAtom($hideChecked)
  const filteredTodos = useAtom($filteredTodos)
  const { add, getItem } = $todos.actions
  return (
    <>
      <div style={{ marginBottom: 5 }}>
        <input
          type="checkbox"
          checked={hideChecked}
          onChange={() => $hideChecked.update((s) => !s)}
        />
        Hide checked items
      </div>
      {filteredTodos.map((data, id) => (
        <Todo data={data} actions={getItem(id)} key={id} />
      ))}
      <button onClick={() => add({ title: 'unnamed', checked: false })}>+</button>
    </>
  )
}

const App = () => <Todos />
export default App
