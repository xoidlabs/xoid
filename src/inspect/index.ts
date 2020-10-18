import { get, use, getState } from '../core'

export const inspect = (obj: any, name?: any) => {
  const { _, ...rest } = obj
  const actions = use(obj)
  if (name) {
    if (actions) {
      console.group(
        '%c' + name,
        'color: #07f',
        onlyPrimitives(getState(obj)),
        '🔷',
        actions
      )
    } else {
      console.group('%c' + name, 'color: #07f')
    }
  }
  Object.keys(rest).forEach((key) => {
    if (typeof obj[key] === 'object' && !allKeysArePrimitives(obj[key])) {
      inspect(obj[key], key)
    }
  })
  console.groupEnd()
}

const onlyPrimitives = (obj: any) => {
  const newObj: any = Array.isArray(obj) ? [] : {}
  Object.keys(obj).filter((key) => {
    const item = obj[key]
    if (typeof item !== 'object') {
      newObj[key] = item
    }
  })
  return newObj
}

const allKeysArePrimitives = (obj: any) => {
  return Object.keys(obj).some((key) => {
    const type = typeof obj[key]
    if (type === 'object') return false
    return true
  })
}
