/* eslint-env node */
module.exports = {
    extends: ['eslint:recommended'],
    parser: '@babel/eslint-parser',
    parserOptions: {
      ecmaVersion: 2017,
      sourceType: 'module',
      ecmaFeatures: {
        experimentalObjectRestSpread: true
      }
    },
    rules: {
      strict: 0,
      curly: ['warn', 'multi-line'],
      'object-curly-spacing': ['warn', 'always'],
      'array-bracket-spacing': ['warn', 'never'],
      'keyword-spacing': ['warn', { 'after': true, 'before': true }],
      'quotes': ['warn', 'single', { 'allowTemplateLiterals': true, 'avoidEscape': true }],
      'no-console': ['off'],
      'arrow-spacing': ['warn'],
      'no-unused-vars': ['off'],
      'getter-return': ['warn', { allowImplicit: true }],
      'no-constant-condition': ['warn'],
      'no-debugger': 'off',
      'comma-dangle': ['error', 'never']
    },
    globals: {

    },
    env: {
      browser: true,
      es6: true
    }
  };
