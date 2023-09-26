import { createEvent } from './internal/lite'

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-interface
export interface InjectionKey<T> extends Symbol {}

declare const voidOnly: unique symbol
type Destructor = () => void | { [voidOnly]: never }
export type EffectCallback = () => void | Destructor

const error = (text: string) => {
  throw new Error(
    `[xoid] \`${text}\` cannot be used outside the setup context. To create a setup context, use the \`useSetup\` hook from a framework integration package.`
  )
}

let adapter = {
  effect: () => error('effect'),
  inject: () => error('inject'),
}

export const inject = <T,>(symbol: InjectionKey<T>): T => (adapter.inject as any)(symbol)

export const effect = (callback: EffectCallback): void => (adapter.effect as any)(callback)

export function setup<T>(this: { inject: typeof inject; effect: typeof effect }, fn: () => T): T {
  const prevAdapter = adapter
  adapter = this as any
  const result = fn()
  adapter = prevAdapter
  return result
}

export const createAdapter = (rest: { inject: typeof inject }) => {
  const mount = createEvent()
  const unmount = createEvent()

  return {
    inject: rest.inject,
    mount: mount.fire,
    unmount: unmount.fire,
    effect: (fn: EffectCallback) =>
      mount.add(() => {
        const result = fn()
        if (typeof result === 'function') unmount.add(result)
      }),
  }
}
