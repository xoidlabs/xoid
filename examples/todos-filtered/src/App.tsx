import React from 'react'
import { create, arrayOf, useStore, set, use, get } from 'xoid'

let i = 256
const uuid = () => (++i).toString()

type TodoPayload = {
  title: string
  checked: boolean
  key: string
}

const TodoModel = (payload: TodoPayload) =>
  create(payload, (store) => ({ toggle: () => set(store.checked, (s) => !s) }))

const $filter = create('all')

const $todos = arrayOf(TodoModel, [
  { title: 'groceries', checked: true, key: uuid() },
  { title: 'world invasion', checked: false, key: uuid() },
])

const $filteredTodos = create((get) => {
  const f = get($filter)
  get($todos)
  return f === 'checked'
    ? $todos.filter((item) => get(item).checked)
    : f === 'unchecked'
    ? $todos.filter((item) => !get(item).checked)
    : [...$todos]
})

export const Todos = () => {
  const [value, onChange] = useStore($filter)
  useStore($filteredTodos)
  return (
    <>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="all">all</option>
        <option value="checked">checked</option>
        <option value="unchecked">unchecked</option>
      </select>
      {$filteredTodos.map((todo) => (
        <Todo
          store={todo}
          remove={() =>
            use($todos).remove((item) => item.key === get(todo.key))
          }
          key={get(todo.key)}
        />
      ))}
      <button
        onClick={() =>
          use($todos).add({ title: 'unnamed', checked: false, key: uuid() })
        }>
        +
      </button>
    </>
  )
}

const Todo = (props: {
  store: ReturnType<typeof TodoModel>
  remove: () => void
}) => {
  const [{ title, checked }, { toggle }] = useStore(props.store)
  return (
    <div>
      <input type="checkbox" checked={checked} onChange={toggle} />
      <input
        style={{
          textDecoration: checked ? 'line-through' : 'none',
        }}
        value={title}
        onChange={(e) => set(props.store.title, e.target.value)}
      />
      <button onClick={props.remove}>x</button>
    </div>
  )
}

export default () => <Todos />
