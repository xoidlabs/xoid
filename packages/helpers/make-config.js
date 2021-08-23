const copy = require('rollup-plugin-copy')
const del = require('rollup-plugin-delete')

module.exports = (options) => {
  const config = []
  let count = 0
  Object.entries(options.entries).forEach(([fileName, fileConfig]) => {
    const input = options.source + '/' + fileName
    Object.entries(fileConfig).forEach(([format, newFileName]) => {
      if(!["amd", "cjs", "system", "es", "esm", "iife", "umd"].includes(format)) return
      const outputFile = options.destination + '/' + newFileName
      const element = {
        input,
        output: {
          file: outputFile,
          format: format,
        },
      }
      element.plugins = options.getPlugins(count) || []
      if(options.copy && count === 0) {
        const targets = Object.entries(options.copy).map(([src, dest]) => {
          return { src, dest }
        })
        element.plugins.push(del({ targets: options.destination }))
        element.plugins.push(copy({ targets }))
      }
      element.external = fileConfig.external || []
      config.push(element)
      count++
    })
  })
  return config
}