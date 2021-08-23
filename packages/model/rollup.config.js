import typescript from 'rollup-plugin-typescript2';

const createOptions = () => ({
  input: './lib/index.tsx',
  plugins: [typescript({ useTsconfigDeclarationDir: true })],
  external: ['@xoid/core', '@xoid/core/utils'],
})

export default [
  {
    ...createOptions(),
    output: {
      file: './index.js',
      format: 'cjs',
    },
  },
  {
    ...createOptions(),
    output: {
      file: './index.esm.js',
      format: 'esm',
    },
  }
];
