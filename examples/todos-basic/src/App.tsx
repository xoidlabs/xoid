import React from 'react'
import x, { useStore, Store } from 'xoid'

type TodoPayload = {
  title: string
  checked: boolean
}

const TodoModel = x((store: Store<TodoPayload>) => ({
  toggle: () => store.checked((s) => !s),
}))

const TodoListModel = x.list(TodoModel, (store) => ({
  add: (p: TodoPayload) => store((s) => [...s, p]),
}))

const store = TodoListModel.create([
  { title: 'groceries', checked: true },
  { title: 'world invasion', checked: false },
])

export const Todos = () => {
  const state = useStore(store)
  const { add } = use(store)
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
  const { title, checked } = useStore(props.store)
  const { toggle } = use(props.store)
  return (
    <div>
      <input type="checkbox" checked={checked} onChange={toggle} />
      <input
        style={{
          textDecoration: checked ? 'line-through' : 'none',
        }}
        value={title}
        onChange={(e) => props.store.title(e.target.value)}
      />
    </div>
  )
}

export default () => <Todos />
