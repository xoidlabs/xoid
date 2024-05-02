import { shallowCopy } from './shallowCopy'

// This function returns a new object with the updated value at the specified path. If the new
// value is the same as the current value, it returns the original object without making changes.
// This function could be using a `remainingPath` logic instead of indexes, but thanks to @appden
// in https://github.com/xoidlabs/xoid/pull/11, the performance is better this way.
export function setIn<T>(obj: T, path: string[], value: any, index = 0): T {
  // When we're at the final path key, simply return the value
  if (index === path.length) return value
  const currentKey = path[index]
  const currentValue = (obj as any)[currentKey]
  const nextValue = setIn(currentValue, path, value, index + 1)

  // With this check, when the target value is same as the source value, the process
  // efficiently exits without ever reaching to a `shallowCopy` call.
  if (nextValue === currentValue) return obj
  const nextObj = shallowCopy(obj)
  nextObj[currentKey] = nextValue
  return nextObj
}
