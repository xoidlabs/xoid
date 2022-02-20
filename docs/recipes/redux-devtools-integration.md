---
id: redux-devtools-integration
title: Redux Devtools integration
---

Import `@xoid/devtools` and connect your atom. It will send action names to the Redux Devtools Extension.

```js
import { devtools } from '@xoid/devtools'
import { create, use } from 'xoid'

const atom = create(
  { alpha: 5 }, 
  (atom) => {
    const $alpha = use(atom, s => s.alpha)
    return {
      inc: () => $alpha(s => s + 1),
      resetState: () => atom({ alpha: 5 })
      deeply: {
        nested: {
          action: () => $alpha(5)
        }
      } 
    }
  }
)
const disconnect = devtools(atom, 'myAtom') // second argument specifies the instance name

const { deeply, incrementAlpha } = use(atom) // can work with destructuring
incrementAlpha() // "*.incrementAlpha"
deeply.nested.action() // "*.deeply.nested.action"
use(atom, s => s.alpha)(25)  // "* Update ([timestamp])
```

