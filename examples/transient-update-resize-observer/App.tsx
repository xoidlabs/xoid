import React, { useEffect, useRef } from 'react'
import { create, set, use, subscribe } from 'xoid'

const ResizeObserver = (window as any).ResizeObserver as any

const createResizeObserver = (element: HTMLDivElement) =>
  create({} as { width: number; height: number }, (store) => {
    const observer = new ResizeObserver(([entry]: any) => {
      const { width, height } = entry.contentRect
      set(store, { width, height })
    })
    observer.observe(element)
    return { cleanup: () => observer.destroy() }
  })

export default () => {
  const ref = useRef<HTMLDivElement>(null)
  console.log('this component renders only once!')

  useEffect(() => {
    if (!ref.current) return
    const store = createResizeObserver(ref.current)
    subscribe(store, ({ width, height }) => {
      ;(ref.current as HTMLDivElement).innerHTML = `${width} x ${height}`
    })
    return use(store).cleanup
  }, [])

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
        }}></div>
    </>
  )
}
