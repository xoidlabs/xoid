---
id: refactoring-react-classes
title: Refactoring React classes
---

### Refactoring React class components

**xoid** can provide a scaffolding system for refactoring React class components into function components. Throughout refactoring, intermediate version of the component keeps working. Here's a basic React-like class component runtime prepared in **xoid**.

```js
import { Store } from 'xoid'

class ReactLike<Props, State> {
  deps!: Store<Props>
  store!: Store<State>
  constructor(deps: Store<Props>, store: Store<State>) {
    this.deps = deps
    this.store = store
  }
  get props() {
    return this.deps()
  }
  get state() {
    return this.store()
  }
  setState(partial: Partial<State>) {
    this.store((state) => ({ ...state, ...partial }))
  }
}
```
Let's assume the following following class component is being refactored.
```js
class App extends React.Component {
  // state
  state = { alpha: 5 }
  // methods
  incrementAlpha = () => {
    this.setState({ alpha: this.state.alpha + 1 })
  }
  render() {
    // render
    return <div onClick={this.incrementAlpha}>{this.state.alpha}</div> 
  }
}
```
Initial refactoring setup looks like the following. All the class methods are moved inside the `Runtime` class, and the content of the render method is separated as a function component. Lifecycle methods are assumed to be handled manually.

```js
const AppSetup = (deps: Store<Props>) => {
  // state
  const store = create({ alpha: 5 })

  class Runtime extends ReactLike {
    // methods
    incrementAlpha = () => {
      this.setState({ alpha: this.state.alpha + 1 })
    }
  }
  return new Runtime(deps, store) 
}

const App = (props: Props) => {
  const self = useSetup(AppSetup, props)
  useStore(self.store)

  // render,`this` replaced with `self`
  return (<div onClick={self.incrementAlpha}>{self.state.alpha}</div>)
}
```
After getting rid of the last usage of `this.setState`, we can get rid of the `Runtime` class too.
```js
const AppSetup = (deps: Store<Props>) => {
  const store = create({ alpha: 5 })
  const incrementAlpha = () => store.alpha(s => s + 1)
  return { store, incrementAlpha }
}

const App = (props: Props) => {
  const self = useSetup(AppSetup, props)
  const { alpha } = useStore(self.store)

  return <div onClick={self.incrementAlpha}>{alpha}</div>
}
```

