import { objectOf, arrayOf, model, use } from './model'
export * from './model'

const x = Object.assign(model.bind({}), { objectOf, arrayOf, model, use })
export default x
