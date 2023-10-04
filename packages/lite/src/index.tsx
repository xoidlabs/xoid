import { LiteAtom, createBaseApi, createInternal } from '../../xoid/src/internal/lite'

export function create<T>(): LiteAtom<T | undefined>
export function create<T>(value: T): LiteAtom<T>
export function create<T>(value?: T): LiteAtom<T> {
  return createBaseApi(createInternal(value as T))
}

export type { LiteAtom }
