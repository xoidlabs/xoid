export interface Config {
  valueSymbol: string | symbol
  actionsSymbol: string | symbol
}

export const configObject: Config = {
  // These symbols will not conflict with equal sign (=) or underscore (_) you may use in your state.
  // Following strings are accompanied with unicode invisible characters.
  // So even if you use plain = or _, they will simply coexist.
  valueSymbol: '=‎‎',
  actionsSymbol: '_‎‎',
}

export const config = (options: Partial<Config>) => {
  Object.keys(options).forEach((key) => {
    // @ts-ignore
    configObject[key] = options[key]
  })
}
