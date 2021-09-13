import React from 'react'
import x, { use, Store, StoreOf } from 'xoid'
import { useStore } from '@xoid/react' 

type TodoType = {
  title: string
  checked: boolean
}

const TodoModel = x((store: Store<TodoType>) => ({
  toggle: () => store.checked((s) => !s),
  rename: (title: string) => store.title(title),
}))

const TodoListModel = x.arrayOf(TodoModel, (store) => ({
  add: (p: TodoType) => store((s) => [...s, p]),
}))

const store = TodoListModel([
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
      <button onClick={() => add({ title: 'untitled', checked: false })}>
        +
      </button>
    </>
  )
}

const Todo = (props: { store: StoreOf<typeof TodoModel> }) => {
  const { title, checked } = useStore(props.store)
  const { toggle, rename } = use(props.store)
  return (
    <div>
      <input type="checkbox" checked={checked} onChange={toggle} />
      <input
        style={{
          textDecoration: checked ? 'line-through' : 'none',
        }}
        value={title}
        onChange={(e) => rename(e.target.value)}
      />
    </div>
  )
}

export default () => <Todos />
