import React from 'react'
import { create, use } from 'xoid'
import { useAtom } from '@xoid/react'
import './styles.css'

const NumberModel = (payload: number) =>
  create(payload, (atom) => ({
    increment: () => atom((state) => state + 1),
    decrement: () => atom((state) => state - 1),
  }))
type NumberType = ReturnType<typeof NumberModel>

const $alpha = NumberModel(0)
const $beta = NumberModel(5)
const $sum = create((get) => get($alpha) + get($beta))

const NumberCounter = (props: { atom: NumberType; color: string }) => {
  const value = useAtom(props.atom)
  const { increment, decrement } = use(props.atom)
  return (
    <div className="container" style={{ background: props.color }}>
      {value}
      <div className="actions">
        <button onClick={decrement}>-</button>
        <button onClick={increment}>+</button>
      </div>
    </div>
  )
}

const Sum = (props: { color: string }) => {
  const state = useAtom($sum)
  return (
    <div className="container" style={{ background: props.color }}>
      {state}
    </div>
  )
}

const App = () => (
  <div className="wrapper">
    <NumberCounter atom={$alpha} color="#1e2043" />
    +
    <NumberCounter atom={$beta} color="#473191" />
    =
    <Sum color="#7634d6" />
  </div>
)

export default App
