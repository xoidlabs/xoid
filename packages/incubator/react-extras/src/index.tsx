import { useAtom, useSetup } from '@xoid/react'
export { slice } from './slice'

/**
 * Can be used to consume a **value-onChange pair** as an atom inside React components.
 *
 * Third argument, when set to `true`, enables optimistic updates. This can be
 * used for keeping a synced local state, and debouncing the updates sent to the parent.
 * @see [xoid.dev/docs/api-react/use-thru](https://xoid.dev/docs/api-react/use-thru)
 */
export const useThru = <T,>(value: T, onChange?: (value: T) => void, optimistic = false) => {
  const atom = useSetup(
    ($props) => {
      const atom = $props.focus('value')
      const props = $props.value
      const prevSet = atom.set
      atom.set = (value: T) => {
        if (props.optimistic) prevSet(value)
        props.onChange?.(value)
      }
      return atom
    },
    { value, onChange, optimistic }
  )
  useAtom(atom)
  return atom
}
