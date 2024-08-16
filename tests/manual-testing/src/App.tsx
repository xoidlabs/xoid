import { Atom, effect } from 'xoid'
import { useSetup } from '@xoid/react'

/* eslint-disable @typescript-eslint/no-namespace */
export namespace WindowEvent {
  export type Props<T extends keyof WindowEventMap> = [
    type: T,
    listener: (ev: WindowEventMap[T]) => any,
    options?: boolean | AddEventListenerOptions
  ]

  export const setup = <T extends keyof WindowEventMap>($props: Atom<Props<T>>) =>
    effect(() =>
      $props.watch((args) => {
        window.addEventListener(...args)
        return () => window.removeEventListener(...args)
      })
    )
}

export const useWindowEvent = <T extends keyof WindowEventMap>(...props: WindowEvent.Props<T>) =>
  useSetup(WindowEvent.setup, props)

function App() {
  useSetup(() => {
    const callback = () => console.log('event')

    effect(() => {
      window.addEventListener('click', callback)
      return () => window.removeEventListener('click', callback)
    })
  })

  return (
    <div id="app">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
    </div>
  )
}

export default App
