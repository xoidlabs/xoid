// This file's contents isn't exported anywhere currently, but historically we've used this,
// And it's a nice complement to setIn, which is a used internal util.

// A recursive function that retrieves a value from a nested object using a path of keys.
export function getIn(obj: any, path: string[], cache = false, index = 0): any {
  if (index === path.length) return obj
  const key = path[index]
  if (cache && !obj[key]) obj[key] = {}
  return getIn(obj[key], path, cache, index + 1)
}
