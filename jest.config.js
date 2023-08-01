const pathsToModuleNameMapper = require('./scripts/paths-to-module-name-mapper')
const { compilerOptions } = require(`${process.cwd()}/tsconfig.json`);

module.exports = {
  "rootDir": ".",
  "transform": {"\\.tsx?$": ['ts-jest']}, 
  "testEnvironment": "jsdom",
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
