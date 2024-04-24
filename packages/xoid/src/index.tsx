import { atom } from './atom'

export * from './atom'
export * from './tracking'
export * from './reactive'
export * from './setup'

/**
 * @deprecated since version 1.0.0beta-12
 *
 * `create` as a default export is deprecated. In the future versions, use this instead:
 * @example
 * // Recommended
 * import { atom } from 'xoid'
 */
export default atom

/**
 * @deprecated since version 1.0.0beta-12
 *
 * `create` as a named export is deprecated. In the future versions, use this instead:
 * @example
 * // Recommended
 * import { atom } from 'xoid'
 */
export const create = atom
