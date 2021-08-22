module.exports = {
  extends: [
    "react-app",
    "plugin:prettier/recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  plugins: [],
  rules: {
    "import/no-extraneous-dependencies": ["error"],
    "@typescript-eslint/explicit-function-return-type": ["off"],
    "@typescript-eslint/explicit-module-boundary-types": ["off"],
    "@typescript-eslint/member-delimiter-style": ["off"],
    '@typescript-eslint/no-explicit-any': ['off'],
    '@typescript-eslint/ban-ts-ignore': ['off'],
    '@typescript-eslint/ban-ts-comment': ['off'],
    '@typescript-eslint/ban-types': ['off'],
    "prettier/prettier": [
      "warn", 
      { singleQuote: true, semi: false, printWidth: 100, endOfLine: 'auto' }
    ],
    '@typescript-eslint/no-extra-semi': ['off'],
    "spaced-comment": ["error", "always", { "markers": ["/"] }]
  },
  settings: {},
  ignorePatterns: ["*.js"],
};