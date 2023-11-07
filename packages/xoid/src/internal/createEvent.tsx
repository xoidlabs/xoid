export const createEvent = () => {
  const fns = new Set<Function>()
  const add = (fn: Function) => {
    fns.add(fn)
  }
  const fire = () => {
    fns.forEach((fn) => fn())
    fns.clear()
  }
  return { add, fire }
}
