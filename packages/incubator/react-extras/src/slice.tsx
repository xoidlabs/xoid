import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector'
import React from 'react'
import { Atom } from 'xoid'

const identity = <T,>(value: T) => value

export const useSelector = <T, U>(
  atom: Atom<T>,
  selector: (value: T) => U = identity as (value: T) => U,
  equals = Object.is
) => useSyncExternalStoreWithSelector(atom.subscribe, atom.get, atom.get, selector, equals)

const getKeys = <T,>(item: T) =>
  Array.isArray(item) ? item.map((_, i) => i) : Object.keys(item as any)

function shallowEqualArrays<T>(a: T[], b: T[]) {
  const len = a.length
  if (b.length !== len) return false
  for (let i = 0; i < len; i++) {
    if (a[i] !== b[i]) {
      return false
    }
  }
  return true
}

export const slice = <T, K extends keyof T, U>(
  atom: Atom<T>,
  fn: (item: Atom<T[K]>, key: string) => U
) =>
  React.createElement(() => (
    <>
      {useSelector(atom, getKeys, shallowEqualArrays).map((key) =>
        fn(atom.focus(key as any), key as any)
      )}
    </>
  ))
