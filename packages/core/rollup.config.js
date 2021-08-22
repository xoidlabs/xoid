import typescript from 'rollup-plugin-typescript2';
import copy from 'rollup-plugin-copy'
import del from 'rollup-plugin-delete'

const makeConfig = (options) => {
  const config = []
  let count = 0
  Object.entries(options.entries).forEach(([fileName, fileConfig]) => {
    const input = options.source + '/' + fileName
    Object.entries(fileConfig).forEach(([format, newFileName]) => {
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

export default makeConfig({
  source: 'lib', 
  destination: 'dist',
  entries: {
    'index.tsx': { cjs: 'index.js', esm: 'esm/index.js' },
    'utils.tsx': { cjs: 'utils.js', esm: 'esm/utils.js' }
  },
  copy: { 'package.json': 'dist' },
  getPlugins: () => ([
    typescript({ useTsconfigDeclarationDir: true, outDir: 'dist' }),
  ]),
})
