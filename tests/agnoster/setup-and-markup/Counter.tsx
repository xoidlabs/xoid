/** @jsxImportSource nity */
import component from 'nity'

const Counter = component({
  props: ['initialValue'],
  slots: ['default'],
  setup($props) {
    const $counter = $props.map((s) => s.initialValue)
    const increment = () => $counter.update((s) => s + 1)
    const decrement = () => $counter.update((s) => s - 1)

    this.effect(() => {
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
})

export default Counter
