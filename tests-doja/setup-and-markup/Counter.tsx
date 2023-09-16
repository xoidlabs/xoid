/** @jsxImportSource doja */
import Doja, { effect, slots } from 'doja'

const Counter = Doja<{ initialValue: number }>(($props) => {
  const $counter = $props.map((s) => s.initialValue)
  const increment = () => $counter.update((s) => s + 1)
  const decrement = () => $counter.update((s) => s - 1)

  effect(() => {
    console.log('mounted')
    return () => console.log('unmounted')
  })

  return (get) => (
    <div>
      count: {get($counter)}
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      {slots()}
    </div>
  )
})

Counter.props = ['initialValue']

export default Counter
