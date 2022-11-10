# @xoid/feature

**@xoid/feature** is a tiny plugin system oriented in JavaScript classes. It provides a type-safe dependency injection mechanism for the classes that refer to each other's instance variables. It especially improves the developer experience for TypeScript users, by reducing the types and the runtime code that needs to be written (demonstrated below). It provides a neat pattern for tree-shakable plugins.

It has 2 exports: `Feature` and `compose` .

Classes that extend from `Feature`, has the following properties by default:
  - There's no need for `.constructor`.
  - `.from` can be used to share data between sibling instances. (dependency injection part)
  - `.options` can be used anywhere.
  - `.getOptions` can be used to merge external options onto the default options.
  - `.main` will run when all the instances are ready.

Example:

```js
import { Feature, compose } from '@xoid/feature'

class Alpha extends Feature<{ alpha?: number }> {
  options = this.getOptions({ alpha: 3 })
  alpha = this.options.alpha
}

class Beta extends Feature<{ beta: number }> {
  beta = this.options.beta
  main() {
    console.log('alpha:', this.from(Alpha).alpha)
  }
}

class Gamma extends Feature<{ message: string }> {
  getSum() {
    return `${this.options.message}${this.from(Alpha).alpha + this.from(Beta).beta}`
  }
}

const init = compose([Alpha, Beta, Gamma], (from) => from(Gamma).getSum())

const result = init({ beta: 2, message: 'The answer is: ' })

console.log(result)
```

Console output:

```
alpha: 3
The answer is: 5
```

Without `@xoid/feature`, the same functionality would require:

```js
class Alpha {
  alpha: number
  static defaultOptions = { alpha: 3 }
  constructor(options: { alpha?: number }) {
    this.alpha = options.alpha ?? Alpha.defaultOptions.alpha
  }
}

class Beta {
  instances!: { Alpha: Alpha }
  beta: number
  constructor(options: { beta: number }) {
    this.beta = options.beta
  }
  main(instances: { Alpha: Alpha }) {
    this.instances = instances
    console.log('alpha:', this.instances.Alpha.alpha)
  }
}

class Gamma {
  instances!: { Alpha: Alpha; Beta: Beta }
  options: { message: string }
  constructor(options: { message: string }) {
    this.options = options
  }
  main(instances: { Alpha: Alpha; Beta: Beta }) {
    this.instances = instances
  }
  getResult() {
    return `${this.options.message}${this.instances.Alpha.alpha + this.instances.Beta.beta}`
  }
}

const init = (
  options: ConstructorParameters<typeof Alpha>[0] &
    ConstructorParameters<typeof Beta>[0] &
    ConstructorParameters<typeof Gamma>[0]
) => {
  const context = {} as Record<string, { main?: Function }>
  [Alpha, Beta, Gamma].forEach((item) => {
    context[item.name] = new item(options)
  })
  Object.keys(context).forEach((key) => context[key]?.main(context))
  return context.Gamma.getSum()
}

const result = init({ beta: 2, message: 'foo' })

console.log(result)
```

## Tree-shaking methodology
This feature is useful if you are a library-author who wants to build a tree-shakable library with a lot of composable classes.

Create the following file:

 `<root>/ids/Alpha.tsx` (identity module)

```js
export const id = Symbol()
export const type = {} as import('../Alpha').default
```

Modify the following lines in existing files:

 `<root>/Alpha.tsx` (real module)

```diff
import { Feature } from '@xoid/feature'
import { id } from './ids/Alpha'

export default class Alpha extends Feature<{ alpha?: number }> {
+ id = id 
  options = this.getOptions({ alpha: 3 })
  alpha = this.options.alpha
}
```

 `<root>/Beta.tsx`
```diff
- import Alpha from './Alpha'
+ import * as Alpha from './ids/Alpha'

class Beta extends Feature() {
  main() {
    console.log(this.from(Alpha).alpha) // This used to work, and still works after the diff
  }
}
```

## Augmentation technique

There's a neat type-safety helper built-in to `@xoid/feature`. The callback argument of `compose` has a second agrument called `types`. `types` should not be used in the runtime, it only serves as a type aggregator. `types` merges the types of all the classes that are composed. In the following example, `draggableProps` key is used multiple times in different features, so that each feature "augments" the same interface. Finally `types` is fed as a parameter type to `useDraggable`

```js
import { Feature, compose } from '@xoid/feature'

class DragHelper extends Feature() {
  draggableProps!: {
    onDragStart: () => void
    onDragEnd: () => void
  }
}

class DropHelper extends Feature() {
  draggableProps!: {
    onDrop: () => void
  }
}

const createDraggable = compose(
  [DragHelper, DropHelper], 
  (from, types) => {
    const useDraggable = (props: typeof types.draggableProps) => {
      // TODO: implement helper
    }
    return { useDraggable }
  }
)

const { useDraggable } = createDraggable({})

// This whole thing would be typesafe thanks to the `types`
useDraggable({ onDragStart, onDragEnd, onDrop })
```


## Note

**@xoid/feature** doesn't depend on `xoid`. It can be used standalone, however using it with `xoid` is synergetically amazing.