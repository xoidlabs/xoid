import { useRef } from 'react'
import { Store } from '../core'
import { useStore } from './useStore'

const useConstant = <T>(fn: () => T): T => {
  const ref = useRef<{ c: T }>()
  if (!ref.current) ref.current = { c: fn() }
  return ref.current.c
}

// TODO: capture creation of selectors here to destroy them?
export const useModel = <T, A>(model: () => Store<T, A>) => {
  const store = useConstant(model)
  return useStore(store)
}
