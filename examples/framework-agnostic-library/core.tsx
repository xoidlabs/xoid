import { Atom, effect } from 'xoid'

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
