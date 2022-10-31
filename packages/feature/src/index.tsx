type Config<T, U> = {
  id?: string | symbol
  defaultOptions?: T
  options?: U
}

export type From = {
  <U extends new (...args: any) => any>(item: U): InstanceType<U>
  <U extends { id: any; type: any }>(item: U): U['type']
}

export abstract class FeatureAbstract<Options, DefaultOptions> {
  externalOptions!: Options
  options!: DefaultOptions & Options
  from!: From
  main?: () => void
}

export type FeatureConstructor = new (options: any) => FeatureAbstract<any, any>

type PrefilledFeature<T> = T extends new (options: any) => infer Q
  ? new (options: {}) => Omit<Q, 'externalOptions'> & { externalOptions: {} }
  : never

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never

type GetKey<I, K extends string | symbol | number> = I extends {
  [L in K]: infer P
}
  ? P
  : never

export type ExtractKey<U, K extends string | number | symbol> = GetKey<UnionToIntersection<U>, K>

type MergedTypes<P extends FeatureConstructor> = {
  [K in keyof UnionToIntersection<InstanceType<P>>]: ExtractKey<InstanceType<P>, K>
}

const REFERENCE = Symbol()

const defaultFrom: any = () => console.warn('Please use it inside compose')

const current = { from: defaultFrom }

const createFrom = (contextMap: any) =>
  function (this: any, input: any) {
    const output = contextMap.get(typeof input === 'object' ? input.id : input)
    if (!output) {
      console.error(`Dependency '${input.name}' not found in '${this.constructor.name}'.`)
    }
    return output
  }

const interceptFrom = <T,>(nextFrom: any, fn: () => T) => {
  current.from = nextFrom
  const ans = fn()
  current.from = defaultFrom
  return ans
}

export function Feature<T extends Config<any, any> = { defaultOptions: {}; options: {} }>(
  config = {
    id: Symbol(),
    defaultOptions: {},
    options: {},
  } as T
) {
  return class {
    static id = config.id

    externalOptions!: T['options']
    options!: T['options'] & T['defaultOptions']
    from!: From

    constructor(options: T['options']) {
      this.from = (a: any) => current.from(a)
      this.options = { ...config.defaultOptions, ...options }
    }
  }
}

export const composeFeatures =
  <P extends FeatureConstructor, V>(
    config: P[],
    afterAll: (from: From, common: MergedTypes<P>) => V
  ) =>
  (options: ExtractKey<InstanceType<P>, 'externalOptions'>) => {
    const contextMap = new Map<P, InstanceType<P>>()
    config
      .map((item) => {
        const instance = runInner(contextMap)(item, options)
        // @ts-ignore
        contextMap.set(item[REFERENCE] || item, instance)
        // @ts-ignore
        if (item.id) {
          // @ts-ignore
          contextMap.set(item.id, instance)
        }
        return instance
      })
      .forEach((instance) => {
        instance?.main?.()
      })
    const ans = afterAll(contextMap.get.bind(contextMap) as From, {} as MergedTypes<P>)
    return ans
  }

const runInner =
  (contextMap: Map<FeatureConstructor, FeatureAbstract<any, any>>) =>
  <P extends FeatureConstructor>(
    item: P,
    options: ExtractKey<InstanceType<P>, 'externalOptions'>
  ) => {
    const from = createFrom(contextMap)
    const instance = interceptFrom(from, () => new item(options))
    instance.from = from
    return instance
  }

export const prefill = <
  T extends FeatureConstructor,
  U extends ExtractKey<InstanceType<T>, 'externalOptions'>
>(
  item: T,
  options: U | ((from: From) => U)
) =>
  // @ts-ignore
  class extends item {
    static [REFERENCE] = item
    constructor() {
      // @ts-ignore
      super(typeof options === 'function' ? options(current.from) : options)
    }
  } as PrefilledFeature<T>
