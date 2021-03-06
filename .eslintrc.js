module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/electron',
    'plugin:import/typescript'
  ],
  rules: {
    'quotes': ['error', 'single'],
    // "quote-props": ["error", "as-needed"] // keep this for auto-fixing as necessary
    '@typescript-eslint/explicit-module-boundary-types': ['off'],
    '@typescript-eslint/no-unused-vars': ['off'],
    '@typescript-eslint/ban-ts-comment': ['off']
  },
  parser: '@typescript-eslint/parser'
}
