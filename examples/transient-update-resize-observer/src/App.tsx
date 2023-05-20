import React from 'react'
import { create } from 'xoid'
import { ReactAdapter, useSetup } from '@xoid/react'
import { ResizeObserver } from '@juggle/resize-observer'

const ResizeObserverSetup = (_: unknown, adapter: ReactAdapter) => {
  const $element = create<HTMLDivElement>()
  const $rect = create<{ width: number; height: number }>()
  const observer = new ResizeObserver(([entry]) => $rect.set(entry.contentRect))

  adapter.effect(() => {
    const element = $element.value
    if (!element) return
    observer.observe(element)
    const unsub = $rect.subscribe((rect) => {
      element.innerHTML = `${rect.width} x ${rect.height}`
    })
    return () => {
      unsub()
      observer.unobserve(element)
    }
  })

  return $element.set
}

const App = () => {
  const ref = useSetup(ResizeObserverSetup)
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
