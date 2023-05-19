import { Adapter, Atom } from 'xoid'

export const CounterSetup = ($props: Atom<{ initialValue: number }>, { effect }: Adapter) => {
  const $counter = $props.map((s) => s.initialValue)

  effect(() => {
    console.log('mounted')
    return () => console.log('unmounted')
  })

  return {
    $counter,
    increment: () => $counter.update((s) => s + 1),
    decrement: () => $counter.update((s) => s - 1),
  }
}