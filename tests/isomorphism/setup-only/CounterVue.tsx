/* eslint-disable react-hooks/rules-of-hooks */
/** @jsx h */
import { defineComponent, h } from 'vue'
import { useSetup } from '@xoid/vue'
import { useAtom } from "packages/vue/src/useAtom"
import { CounterSetup } from './CounterSetup'

const CounterVue = defineComponent({
  props: {
    initialValue: { type: Number, required: true },
  },
  setup(props) {
    const { $counter, increment, decrement } = useSetup(CounterSetup, props)
    const counter = useAtom($counter)
    return () => (
      <div>
        count: {counter.value}
        <button onClick={increment}>+</button>
        <button onClick={decrement}>-</button>
      </div>
    )
  },
})

export default CounterVue
