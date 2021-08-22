// @ts-nocheck
export * from '@xoid/core'
export * from '@xoid/model'

import * as A from '@xoid/core'
import * as B from '@xoid/model'
import { model } from '@xoid/model'
const x = Object.assign(model.bind({}), A, B)
export default x
