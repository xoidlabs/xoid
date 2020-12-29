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
  const get = useStore()
  get(store)
  return (
    <>
      {store.map((todo, key) => (
        <div key={key}>
          <input
            type="checkbox"
            checked={get(todo.checked)}
            onChange={use(todo).toggle}
          />
          <input
            style={{
              textDecoration: get(todo.checked) ? 'line-through' : 'none',
            }}
            value={get(todo.title)}
            onChange={(e) => set(todo.title, e.target.value)}
          />
        </div>
      ))}
      <button
        onClick={() => use(store).add({ title: 'unnamed', checked: false })}>
        +
      </button>
    </>
  )
}

export default () => <Todos />
