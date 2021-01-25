import React from 'react'
import { create, arrayOf, useStore, set, use } from 'xoid'

type TodoPayload = {
  title: string
  checked: boolean
}

const TodoModel = (payload: TodoPayload) =>
  create(payload, (store) => ({ toggle: () => set(store.checked, (s) => !s) }))

const store = arrayOf(TodoModel, [
  { title: 'groceries', checked: true },
  { title: 'world invasion', checked: false },
])

export const Todos = () => {
  useStore(store)
  return (
    <>
      {store.map((todo, key) => (
        <Todo store={todo} key={key} />
      ))}
      <button
        onClick={() => use(store).add({ title: 'unnamed', checked: false })}>
        +
      </button>
    </>
  )
}

const Todo = (props: { store: ReturnType<typeof TodoModel> }) => {
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
    </div>
  )
}

export default () => <Todos />
