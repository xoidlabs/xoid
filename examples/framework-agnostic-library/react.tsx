import { useSetup } from '@xoid/react'
import { WindowEvent } from './core'

export const useWindowEvent = <T extends keyof WindowEventMap>(...props: WindowEvent.Props<T>) =>
  useSetup(WindowEvent.setup, props)
