export const fire = (set: Set<() => void>, keepListeners?: boolean) => {
  set.forEach((fn) => fn())
  if (!keepListeners) set.clear()
}
