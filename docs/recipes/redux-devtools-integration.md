---
id: redux-devtools-integration
title: Redux Devtools integration
---

Import `@xoid/devtools` and connect your atom. It will send generated action names to the Redux Devtools Extension.

```js
import { NumberModel } from './some-file'
import { devtools } from '@xoid/devtools'
import { create, use } from 'xoid'

const alpha = NumberModel(5)
const beta = NumberModel(8)
const gamma = create({ deep: 1000 })
const disconnect = devtools({ alpha, beta, gamma }, 'myStore') 

use(alpha).inc() // "(alpha).inc"
use(beta).inc() // "(beta).inc"
use(gamma, s => s.deep)(3000)  // "(gamma) Update ([timestamp])
```

