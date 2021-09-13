import typescript from 'rollup-plugin-typescript2';
const makeConfig = require('../helpers/make-config')

export default makeConfig({
  source: 'lib', 
  destination: 'dist',
  entries: {
    'index.tsx': { 
      cjs: 'index.js', 
      esm: 'index.esm.js', 
      external: ['@xoid/engine'] 
    },
  },
  copy: { 'package.json': 'dist', 'README.md': 'dist' },
  getPlugins: () => ([typescript({ useTsconfigDeclarationDir: true })])
})
