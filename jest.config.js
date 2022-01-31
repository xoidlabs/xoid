module.exports = {
  "rootDir": ".",
  "transform": {"\\.tsx?$": ['ts-jest']}, 
  "testEnvironment": "jsdom",
  "modulePathIgnorePatterns": [
    "dist",
    "tree"
  ],
  "moduleNameMapper": {
    "^@xoid(.*)": "<rootDir>/packages$1/lib",
    "xoid": "<rootDir>/packages/xoid/lib",
  },
  "testRegex": "test.(js|ts|tsx)$",
  "coverageDirectory": "./coverage/",
  "collectCoverage": false,
}
