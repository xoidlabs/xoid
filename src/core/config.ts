interface Config {
  valueSymbol: string | symbol
  actionsSymbol: string | symbol
  // more options to come
}

export const configObject: Config = {
  valueSymbol: '=', //🔴
  actionsSymbol: '_', //🔵
}

export const config = (options: Partial<Config>) => {
  Object.keys(options).forEach((key) => {
    // @ts-ignore
    configObject[key] = options[key]
  })
}
