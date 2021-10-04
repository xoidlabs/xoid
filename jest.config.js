module.exports = {
  "rootDir": ".",
  "transform": {"\\.tsx?$": ['ts-jest']}, 
  "testEnvironment": "jsdom",
  "modulePathIgnorePatterns": [
    "dist",
    "tree"
  ],
  "testRegex": "test.(js|ts|tsx)$",
  "coverageDirectory": "./coverage/",
  "collectCoverage": false,
}
