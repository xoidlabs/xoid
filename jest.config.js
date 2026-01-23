const { pathsToModuleNameMapper } = require('ts-jest')
const { compilerOptions } = require(`${process.cwd()}/tsconfig.json`);

module.exports = {
  "rootDir": ".",
  "transform": {"\\.tsx?$": ['ts-jest']}, 
  "testEnvironment": "jsdom",
  "testEnvironmentOptions": {
    "customExportConditions": ["node", "node-addons"]
  },
  "modulePathIgnorePatterns": [
    "dist",
    "tree",
    ".backup"
  ],
  "moduleNameMapper": pathsToModuleNameMapper(compilerOptions.paths || {}, {
      prefix: '<rootDir>/',
    }),
  "testRegex": "test.(js|ts|tsx)$",
  "coverageDirectory": "./coverage/",
  "collectCoverage": false,
}
