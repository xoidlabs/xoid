import { use, get } from '../core'

export const inspect = (obj: any, name?: any) => {
  const actions = use(obj)
  if (name) {
    if (actions) {
      const content = onlyPrimitives(get(obj))
      console[obj.length && obj.length > 8 ? 'groupCollapsed' : 'group'](
        '%c' + name,
        'color: #07f',
        content,
        '🔷',
        actions
      )
    } else {
      console.group('%c' + name, 'color: #07f')
    }
  }
  Object.keys(obj).forEach((key) => {
    if (
      key !== '_' &&
      typeof obj[key] === 'object' &&
      !allKeysArePrimitives(obj[key])
    ) {
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
