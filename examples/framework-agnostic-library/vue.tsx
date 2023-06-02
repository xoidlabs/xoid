import { useSetup } from '@xoid/vue'
import { WindowEvent } from './core'

export const useWindowEvent = <T extends keyof WindowEventMap>(...props: WindowEvent.Props<T>) =>
  useSetup(WindowEvent.setup, props)
