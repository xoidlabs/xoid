interface Config {
  valueSymbol: string | symbol
  actionsSymbol: string | symbol
  // more options to come
}
// TODO: use a rare unicode _ and = for those, maybe with some invisible characthers
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
