export const add = (set: Set<() => void>, fn: unknown) => {
  if (typeof fn === 'function') set.add(fn as () => void)
}
