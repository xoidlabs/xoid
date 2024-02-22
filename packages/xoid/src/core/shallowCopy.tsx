export const shallowCopy = (obj: unknown) =>
  Array.isArray(obj)
    ? obj.slice() // avoid _spread polyfill
    : Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj))
