// export default defineConfig({
//   root: './tests/manual-testing/src',
//   plugins: [
//     tsconfigPaths(),
//     // macrosPlugin(),
//   ],
// })

import { resolve } from 'path'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'packages/xoid/src/index.tsx'),
      name: 'xoid',
      // the proper extensions will be added
      fileName: 'xoid',
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['vue'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
