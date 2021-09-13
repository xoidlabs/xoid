import React from 'react'
import { create, ready, subscribe } from 'xoid'
import { useSetup } from '@xoid/react'

const ResizeObserver = (window as any).ResizeObserver as any

const ROSetup = (_: unknown, onCleanup: (fn: Function) => void) => {
  const ref = create<HTMLDivElement>()
  const store = create({} as { width: number; height: number })
  const observer = new ResizeObserver(([entry]) => store(entry.contentRect))
  subscribe(ref, (element) => {
    if(element) observer.observe(element)
    return () => observer.disconnect(element)
  })
  subscribe(store, ({ width, height }) => ready(ref).innerHTML(`${width} x ${height}`))
  return ref
}

export default () => {
  const ref = useSetup(ROSetup)
  console.log('this component renders only once!')

  return (
    <>
      <p>This div won't rerender, try resizing it and look at the console!</p>
      <div
        ref={ref}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'scroll',
          width: 225,
          height: 102,
          resize: 'both',
          background: 'rebeccapurple',
          color: 'white',
          fontSize: 25,
        }} />
    </>
  )
}
