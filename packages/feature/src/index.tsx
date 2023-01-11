export type From = {
  <T extends new (...args: any) => any>(item: T): InstanceType<T>
  <T extends { id: any; type: any }>(item: T): T['type']
}

export type FeatureConstructor = new (options: any, from?: any) => Feature<any>

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

export class Feature<T = {}> {
  id?: PropertyKey
  externalOptions!: T
  options!: T
  from: From = function () {
    throw new Error('`this.from` cannot be used outside the `compose` context.')
  }
  getOptions = <U,>(defaultOptions: U) => ({
    ...defaultOptions,
    ...this.externalOptions,
  })
  constructor(options: T, from?: From) {
    this.options = options
    this.externalOptions = options
    if (from) this.from = from
  }
}

const traversePrototypeChain = (instance: any, fn: any) => {
  const prototype = Object.getPrototypeOf(instance)
  const { constructor } = prototype
  if (constructor === Feature || constructor === Function) return
  fn(constructor)
  traversePrototypeChain(prototype, fn)
}

function registerFeature(
  contextMap: Map<PropertyKey | FeatureConstructor, Feature<unknown>>,
  instance: Feature<any>
) {
  traversePrototypeChain(instance, (ctor: FeatureConstructor) => contextMap.set(ctor, instance))
  if (instance.id) contextMap.set(instance.id, instance)
}

export const compose =
  <P extends FeatureConstructor, V>(
    config: P[],
    getAnswer: (from: From, common: MergedTypes<P>) => V
  ) =>
  (options: ExtractKey<InstanceType<P>, 'externalOptions'>) => {
    const contextMap = new Map<P | PropertyKey, Feature<unknown>>()
    function from(this: any, input: any) {
      const output = contextMap.get(typeof input === 'object' ? input.id : input)
      if (!output) {
        throw new Error(`Dependency '${input.name}' was not found in '${this.constructor.name}'.`)
      }
      return output
    }

    // if (typeof config === 'function') config(from)
    ;(config as P[])
      .map((item) => {
        const instance = new item(options, from)
        registerFeature(contextMap, instance)
        return instance
      })
      .forEach((instance) => (instance as any)?.main?.())

    return getAnswer(from, {} as MergedTypes<P>)
  }

// export const patch = <P extends FeatureConstructor, U extends {}>(ctor: P, prefilledOptions: U) =>
//   // @ts-ignore
//   class extends ctor {
//     constructor(options: any, from: From) {
//       super({ ...prefilledOptions, ...options }, from)
//     }
//   }
