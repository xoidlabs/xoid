import { useSetup, useAtom } from '@xoid/react'
import { create, Atom, GetState } from 'xoid'

const setup =
  <T, U>(fn: ($props: Atom<T>, adapter: ReactAdapter) => (get: GetState) => U) =>
  (props: T) => {
    const setup = useSetup(fn, props)
    return useAtom(() => create(setup))
  }

export default setup
