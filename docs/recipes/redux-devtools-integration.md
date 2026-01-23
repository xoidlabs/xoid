---
id: redux-devtools-integration
title: Redux Devtools integration
---

Import `@xoid/devtools` and set a `debugValue` to your atom. It will send values to the Redux Devtools Extension.

```js
import { devtools } from '@xoid/devtools'
import { atom, use } from 'xoid'
devtools() // run once

const $atom = atom(
  { alpha: 5 }, 
  (a) => {
    const $alpha = a.focus(s => s.alpha)
    return {
      inc: () => $alpha.update(s => s + 1),
      resetState: () => a.set({ alpha: 5 })
      deeply: {
        nested: {
          action: () => $alpha.set(5)
        }
      } 
    }
  }
)

$atom.debugValue = '$atom' // enable watching it with devtools

const { deeply, inc } = $atom.actions // destructuring is no problem
inc() // logs "($atom).inc"
deeply.nested.action() // logs "($atom).deeply.nested.action"
$atom.focus(s => s.alpha).set(25)  // logs "($atom) Update ([timestamp])
```