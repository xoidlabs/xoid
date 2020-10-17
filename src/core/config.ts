interface Config {
  valueSymbol: string | symbol
  actionsSymbol: string | symbol
  // more options to come
}

export const configObject: Config = {
  valueSymbol: '=', //Symbol('💜'),
  actionsSymbol: '_', //Symbol('💙'),
}

export const config = (options: Partial<Config>) => {
  Object.keys(options).forEach((key) => {
    // @ts-ignore
    configObject[key] = options[key]
  })
}
