import { shallowCopy } from './shallowCopy'

// A recursive function that sets a value in a nested object using a path of keys.
// It returns a new object with the updated value at the specified path. If the new value
// is the same as the current value, it returns the original object without making changes.
export function setIn<T>(obj: T, path: string[], value: any, index = 0): T {
  if (index === path.length) return value
  const key = path[index]
  const currentValue = (obj as any)[key]
  const nextValue = setIn(currentValue, path, value, index + 1)
  // this check holds, because we can avoid recursively copying the parent objects
  if (nextValue === currentValue) return obj
  const nextObj = shallowCopy(obj)
  nextObj[key] = nextValue
  return nextObj
}
