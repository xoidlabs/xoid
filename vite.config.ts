import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
// import macrosPlugin from "vite-plugin-babel-macros"

export default defineConfig({
  root: './tests/manual-testing/src',
  plugins: [
    tsconfigPaths(),
    // macrosPlugin(),
  ],
})
