---
id: refactoring-react-classes
title: Refactoring React classes
---

**xoid** can provide a scaffolding system for refactoring React class components into function components. During refactoring, intermediate version of the component keeps working. 

Let's imagine that the following class component is going to be refactored:
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

Here's a basic React-like class component runtime prepared with **xoid**.

```js
import { create, Atom } from 'xoid'

class Runtime {
  $props: Atom<Props>;
  $state!: Atom<State>;
  constructor($props: Atom<Props>) {
    this.$props = $props;
  }
  get props() {
    return this.$props.value;
  }
  get state() {
    return this.$state.value;
  }
  set state(s) {
    this.$state = create(s)
  }
  setState(partial: Partial<State>) {
    this.$state.update((s) => ({ ...s, ...partial }));
  }
}
```
We can then easily evolve into the following, working structure without too much refactor:
```js
class AppRuntime extends Runtime<> {
  state = { alpha: 5 }
  incrementAlpha = () => {
    this.setState({ alpha: this.state.alpha + 1 })
  }
}

const App = (props: Props) => {
  const self = useSetup(($props) => new AppRuntime($props), props)
  useAtom(self.$state)

  return <div onClick={self.incrementAlpha}>{self.state.alpha}</div>
}
```
Observe that the only big differece is replacing `this` in the render function with `self`.

After getting rid of `this.setState` usages, we can get rid of the `Runtime` class too.
```js
const App = (props: Props) => {
  const self = useSetup(($props) => {
    const $state = create({ alpha: 5 })
    const incrementAlpha = () => $state.focus('alpha').update((s) => s + 1)
    return { $state, incrementAlpha }
  }, props)

  const { alpha } = useAtom(self.$state)

  return <div onClick={self.incrementAlpha}>{alpha}</div>
}
```
