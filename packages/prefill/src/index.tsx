import React from 'react'

export type ComponentType = keyof JSX.IntrinsicElements | React.JSXElementConstructor<any>

export type Optional<T, U extends PropertyKey> = Omit<T, Extract<keyof T, U>> &
  Partial<Pick<T, Extract<keyof T, U>>>

export type PropsOf<T extends ComponentType, BoxProps> = React.ComponentProps<T> & BoxProps

export type Box<BoxProps = {}> = <
  Extras,
  PassDown extends Partial<PropsOf<T, BoxProps>>,
  T extends ComponentType = 'div'
>(
  as: T,
  options: PassDown | ((extras: Extras) => PassDown)
) => <U = JSX.Element>(
  props: Extras & Optional<Omit<PropsOf<T, BoxProps>, keyof Extras>, keyof PassDown>
) => U

const proxy = (item: any) => {
  const set = new Set<string>()
  const proxy = new Proxy(item, {
    get(target, key) {
      set.add(key as string)
      return Reflect.get(target, key)
    },
  })
  return [proxy, set] as const
}

const omit = (object: any, set: Set<string>) => {
  set.forEach(value => delete object[value])
  return object
}

const getPassdownProps = (options: any, props: any) => {
  if (typeof options === 'function') {
    const [propsProxy, nonPassProps] = proxy(props)
    const nextOptions = options(propsProxy)
    const nextProps = omit({ ...props }, nonPassProps)
    return [nextOptions, nextProps]
  } else {
    return [{ ...options }, { ...props }]
  }
}

const classNamePlugin = (left: { className?: string }, right: { className?: string }) => {
  const { className: cx1 } = left
  const { className: cx2 } = right
  if (cx1 && cx2) right.className = `${cx1} ${cx2}`
}

export const prefill = function (this: any, as: any, options: any) {
  return React.forwardRef((props, ref) => {
    const [nextOptions, nextProps] = getPassdownProps(options, props)
    if (ref) nextProps.ref = ref
    ;(this || classNamePlugin)(nextOptions, nextProps)
    const finalProps = Object.assign(nextOptions, nextProps)
    // Avoid extra `React.createElement` call if it's a non-intrinsic element
    // This is also good for React Devtools
    return typeof as === 'function' ? as(finalProps) : React.createElement(as, finalProps)
  })
} as Box

export default prefill
