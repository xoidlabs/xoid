import { atom } from './atom'
import { inject as injectDeprecated, effect as effectDeprecated } from './setup'

export * from './internal/types'
export { atom }

/**
 * @deprecated since version 1.0.0beta-12
 *
 * `create` as a named export is deprecated. In the future versions, use this instead:
 * @example
 * // Recommended
 * import { atom } from 'xoid'
 */
export const create = atom

/**
 * @deprecated since version 1.0.0beta-12
 *
 * Default export is deprecated. In the future versions, use this instead:
 * @example
 * // Recommended
 * import { atom } from 'xoid'
 */
export default create

export const inject = injectDeprecated
export const effect = effectDeprecated
