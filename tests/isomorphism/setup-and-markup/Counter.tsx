/** @jsxImportSource xoid/copy */
import { Component } from 'xoid'

const Counter: Component<{ initialValue: number }, 'default'> = {
  props: ['initialValue'],
  slots: ['default'],
  render($props, adapter) {
    const $counter = $props.map((s) => s.initialValue)
    const increment = () => $counter.update((s) => s + 1)
    const decrement = () => $counter.update((s) => s - 1)

    adapter.effect(() => {
      console.log('mounted')
      return () => console.log('unmounted')
    })

    return (get, slots) => (
      <div>
        count: {get($counter)}
        <button onClick={increment}>+</button>
        <button onClick={decrement}>-</button>
        {slots()}
      </div>
    )
  },
}

export default Counter
