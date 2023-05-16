/** @jsx jsx */
import { Component } from 'xoid'

const Counter: Component<{ initialValue: number }> = ($props, { effect }) => {
  const $counter = $props.map((s) => s.initialValue)
  const increment = () => $counter.update((s) => s + 1)
  const decrement = () => $counter.update((s) => s - 1)

  effect(() => {
    console.log('mounted')
    return () => console.log('unmounted')
  })

  return (get, jsx) => (
    <div>
      count: {get($counter)}
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  )
}

export default Counter
