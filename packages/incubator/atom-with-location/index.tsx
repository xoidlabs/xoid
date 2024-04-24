import { atom } from 'xoid'

type Location = {
  pathname?: string
  searchParams?: URLSearchParams
  hash?: string
}

const get = (): Location => {
  if (typeof window === 'undefined' || !window.location) {
    return {}
  }
  return {
    pathname: window.location.pathname,
    searchParams: new URLSearchParams(window.location.search),
    hash: window.location.hash,
  }
}

const set = (location: Location): void => {
  const url = new URL(window.location.href)
  if ('pathname' in location) url.pathname = location.pathname!
  if ('searchParams' in location) url.search = location.searchParams!.toString()
  if ('hash' in location) url.hash = location.hash!
  window.history.pushState(null, '', url)
}

const subscribe = (callback: () => void) => {
  window.addEventListener('popstate', callback)
  return () => window.removeEventListener('popstate', callback)
}

type Options<T> = {
  get?: () => T
  set?: (location: T, options?: { replace?: boolean }) => void
  subscribe?: (callback: () => void) => () => void
}

export const atomWithLocation = (options: Options<Location> = { get, set, subscribe }) =>
  atom.call(options)
