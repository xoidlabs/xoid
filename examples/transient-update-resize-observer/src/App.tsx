import React from 'react'
import { create, effect } from 'xoid'
import { useSetup } from '@xoid/react'
import { ResizeObserver } from '@juggle/resize-observer'

const ResizeDisplaySetup = (_: unknown, onCleanup: (fn: () => void) => void) => {
  const $ref = create<HTMLDivElement>()
  const $rect = create({} as { width: number; height: number })
  const $xy = create((get) => `${get($rect).width} x ${get($rect).height}`)

  const observer = new ResizeObserver(([entry]) => $rect(entry.contentRect))
  onCleanup(observer.disconnect)

  const cleanup = effect($ref, (element) => {
    if (!element) return
    observer.observe(element)
    const unsub = effect($xy, (xy) => (element.innerHTML = xy))
    return () => {
      unsub()
      observer.unobserve(element)
    }
  })
  onCleanup(cleanup)
  return $ref
}

const App = () => {
  const ref = useSetup(ResizeDisplaySetup)
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
        }}
      />
    </>
  )
}

export default App
