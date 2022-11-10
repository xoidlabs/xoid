import { useSetup } from '@xoid/react'

const ItemsModel = ($props) => {
  const { getActions, getInitialState } = $props.value
  const $value = $props.focus('value')
  $value.set = (s) => $props.value.onChange(s)

  let nextId = $value.value.length
  const getItem = (id) => {
    const index = $value.value.findIndex((item) => item.id === id)
    return $value.focus(index)
  }

  return {
    add: () => {
      $value.update((s) => [...s, getInitialState(nextId)])
      nextId++
    },
    getActions: (id) => {
      const $item = getItem(id)
      return {
        remove: (id) => $value.update((s) => s.filter((item) => item.id !== id)),
        ...getActions($item),
      }
    },
  }
}

const useItems = (props) => useSetup(ItemsModel, props)

export default useItems
