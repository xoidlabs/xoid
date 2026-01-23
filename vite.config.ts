import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
// import macrosPlugin from "vite-plugin-babel-macros"

// This only serves for manual testing of the library
export default defineConfig({
  root: './tests/manual-testing/src',
  plugins: [
    tsconfigPaths(),
    // macrosPlugin(),
  ],
})
