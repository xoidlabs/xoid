# @xoid/feature

**@xoid/feature** is a runtime for initializing multiple JavaScript classes. It provides a type-safe dependency injection mechanism for the classes that refer to each other's instance variables. It especially improves the developer experience for TypeScript users, by reducing the types and the runtime code that needs to be written (demonstrated below). It can be used as a plugin system, and it provides a neat pattern for modularity and tree-shakable plugins.

It has 3 exports: `Feature`, `composeFeatures` and `prefill`.

Classes that extend from `Feature`, has the following properties by default:
  - There's no need for `.constructor`.
  - `.from` can be used to share data between sibling instances. (dependency injection part)
  - `.main` will run when all the instances are ready.
  - `.options` can be used anywhere.
  - If `defaultOptions` if provided, `.options` will be merged onto that.

Example:

```js
import { Feature, composeFeatures } from '@xoid/feature'

class Alpha extends Feature({
  defaultOptions: { alpha: 3 },
  options: {} as { alpha?: number },
}) {
  alpha = this.options.alpha
}

class Beta extends Feature({
  options: {} as { beta: number },
}) {
  beta = this.options.beta
  main() {
    console.log('alpha:', this.from(Alpha).alpha)
  }
}

class Gamma extends Feature({ 
  options: {} as { message: string }
}) {
  getSum() {
    return `${this.options.message}${this.from(Alpha).alpha + this.from(Beta).beta}`
  }
}

const init = composeFeatures([Alpha, Beta, Gamma], (from) => from(Gamma).getSum())

const result = init({ beta: 2, message: 'The answer is: ' })

console.log(result)
```

Console output:

```
alpha: 3
The answer is: 5
```

If we'd like to prefill `Beta`'s options, we could use `prefill`:

```js
import { prefill } from '@xoid/feature'

const init = composeFeatures(
  [
    Alpha, 
    prefill(Beta, (from) => ({ beta: from(Alpha).alpha })), 
    Gamma
  ],
  (from) => from(Gamma).getSum()
)

const result = init({ message: 'The answer is: ' }) // doesn't expect `beta: number` anymore.
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

## Best practice: Isolation
This practice would be unnecessary for most people, but it can be useful if you are a library-author who wants to build a tree-shakable library with a lot of composable classes.

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

export default class Alpha extends Feature({
+ id,
  defaultOptions: { alpha: 3 },
  options: {} as { alpha?: number },
}) {
  alpha = this.options.alpha
}
```
 `<root>/Beta.tsx`
```diff
+ import * as Alpha from './ids/Alpha'
- import Alpha from './Alpha'

class Beta extends Feature() {
  main() {
    console.log(this.from(Alpha).alpha) // This used to work, and still works after the diff
  }
}
```

## Augmentation technique

Second argument of `composeFeatures` is a callback function, and the second argument of this callback function is `types`. `types` should not be used in the runtime, it should only be used for type-safety purposes. `types` aggregates all the instance variables and members of the classes that are composed. If there are multiple variables with the same name, their interfaces will be merged. In the following example, `draggableProps` variable is used multiple times, and its merged interface is being fed to the implementation of `useDraggable`

```js
import { Feature, composeFeatures } from '@xoid/feature'

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

const createDraggable = composeFeatures(
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