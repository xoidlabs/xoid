export type From = {
  <T extends new (...args: any) => any>(item: T): InstanceType<T>
  <T extends { id: any; type: any }>(item: T): T['type']
}

export type FeatureConstructor = new (options: any) => Feature<any>

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never

type GetKey<I, K extends PropertyKey> = I extends {
  [L in K]: infer P
}
  ? P
  : never

export type ExtractKey<U, K extends PropertyKey> = GetKey<UnionToIntersection<U>, K>

type MergedTypes<P extends FeatureConstructor> = {
  [K in keyof UnionToIntersection<InstanceType<P>>]: ExtractKey<InstanceType<P>, K>
}

const defaultFrom: any = () => {
  throw new Error('`this.from` cannot be used outside the `compose` context.')
}

const current = { from: defaultFrom }

const createFrom = (contextMap: any) =>
  function (this: any, input: any) {
    const output = contextMap.get(typeof input === 'object' ? input.id : input)
    if (!output) {
      throw new Error(`Dependency '${input.name}' was not found in '${this.constructor.name}'.`)
    }
    return output
  }

export class Feature<T = {}> {
  id?: PropertyKey
  externalOptions!: T
  options!: T
  from: From = (a: any) => current.from(a)
  getOptions = <U,>(defaultOptions: U) => ({
    ...defaultOptions,
    ...this.externalOptions,
  })
  constructor(options: T) {
    this.options = options
    this.externalOptions = options
  }
}

export const compose =
  <P extends FeatureConstructor, V>(
    config: P[],
    getAnswer: (from: From, common: MergedTypes<P>) => V
  ) =>
  (options: ExtractKey<InstanceType<P>, 'externalOptions'>) => {
    const contextMap = new Map<P | PropertyKey, Feature<unknown>>()
    const from = createFrom(contextMap)
    current.from = from

    config
      .map((item) => {
        const instance = new item(options)
        instance.from = from
        contextMap.set(item, instance)
        const parentPrototype = Object.getPrototypeOf(item)
        if (parentPrototype !== Feature) contextMap.set(parentPrototype, instance)

        if (instance.id) {
          contextMap.set(instance.id, instance)
        }
        return instance
      })
      .forEach((instance) => {
        ;(instance as any)?.main?.()
      })
    current.from = defaultFrom

    return getAnswer(contextMap.get.bind(contextMap) as From, {} as MergedTypes<P>)
  }
