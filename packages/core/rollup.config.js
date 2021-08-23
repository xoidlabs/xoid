import typescript from 'rollup-plugin-typescript2';
const makeConfig = require('../helpers/make-config')

export default makeConfig({
  source: 'lib', 
  destination: 'dist',
  entries: {
    'index.tsx': { cjs: 'index.js', esm: 'esm/index.js' },
    'utils.tsx': { cjs: 'utils.js', esm: 'esm/utils.js' }
  },
  copy: { 'package.json': 'dist' },
  getPlugins: () => ([typescript({ useTsconfigDeclarationDir: true })]),
})
