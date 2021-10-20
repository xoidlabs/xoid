import React from 'react'
import { create, lens, effect } from 'xoid'
import { useSetup } from '@xoid/react'
import { ResizeObserver } from '@juggle/resize-observer'

const ROSetup = (_: unknown, onCleanup: (fn: Function) => void) => {
  const ref = create<HTMLDivElement>()
  const $rect = create({} as { width: number; height: number })

  const observer = new ResizeObserver(([entry]) => $rect(entry.contentRect))
  onCleanup(observer.destroy)

  onCleanup(
    effect(ref, (element) => {
      if (!element) return
      observer.observe(element)
      const unsub = effect($rect, lens(element, 'innerHTML'))
      return () => {
        unsub()
        observer.disconnect(element)
      }
    })
  )
  return ref
}

const App = () => {
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
        }}
      />
    </>
  )
}

export default App
