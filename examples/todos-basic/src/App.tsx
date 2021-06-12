import React from 'react'
import x, { create, arrayOf, useStore } from 'xoid'

type TodoPayload = {
  title: string
  checked: boolean
}

const TodoModel = x({ title: x.string, checked: x.boolean }, (s) => ({
  toggle: () => (s.checked = !s.checked),
}))

const store = x.arrayOf(TodoModel)([
  { title: 'groceries', checked: true },
  { title: 'world invasion', checked: false },
])

export const Todos = () => {
  const [state, { add }] = useStore(store)
  return (
    <>
      {state.map((todo, key) => (
        <Todo store={todo} key={key} />
      ))}
      <button onClick={() => add({ title: 'unnamed', checked: false })}>
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
        onChange={(e) => (props.store.title = e.target.value)}
      />
    </div>
  )
}

export default () => <Todos />
