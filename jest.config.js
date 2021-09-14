module.exports = {
  "rootDir": ".",
  transform: {"\\.tsx?$": ['ts-jest']}, 
  "testEnvironment": "jsdom",
  "modulePathIgnorePatterns": [
    "dist"
  ],
  "testRegex": "test.(js|ts|tsx)$",
  "coverageDirectory": "./coverage/",
  "collectCoverage": false
}
