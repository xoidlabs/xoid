---
id: redux-devtools-integration
title: Redux Devtools integration
---

Import `@xoid/devtools` and set a `debugValue` to your atom. It will send values to the Redux Devtools Extension.

```js
import { devtools } from '@xoid/devtools'
import { create, use } from 'xoid'
devtools() // run once

const atom = create(
  { alpha: 5 }, 
  (atom) => {
    const $alpha = atom.focus(s => s.alpha)
    return {
      inc: () => $alpha.update(s => s + 1),
      resetState: () => atom.set({ alpha: 5 })
      deeply: {
        nested: {
          action: () => $alpha.set(5)
        }
      } 
    }
  }
)

atom.debugValue = 'myAtom' // enable watching it by the devtools

const { deeply, incrementAlpha } = atom.actions // destructuring is no problem
incrementAlpha() // logs "(myAtom).incrementAlpha"
deeply.nested.action() // logs "(myAtom).deeply.nested.action"
atom.focus(s => s.alpha).set(25)  // logs "(myAtom) Update ([timestamp])
```