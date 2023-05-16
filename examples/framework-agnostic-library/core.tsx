/* eslint-disable @typescript-eslint/no-namespace */
import { Atom, Adapter } from 'xoid'

export namespace WindowEvent {
  export type Props<T extends keyof WindowEventMap> = [
    type: T,
    listener: (ev: WindowEventMap[T]) => any,
    options?: boolean | AddEventListenerOptions
  ]

  export const setup = <TType extends keyof WindowEventMap>(
    $props: Atom<Props<TType>>,
    { effect }: Adapter
  ) =>
    effect(() =>
      $props.watch((args) => {
        window.addEventListener(...args)
        return () => window.removeEventListener(...args)
      })
    )
}
