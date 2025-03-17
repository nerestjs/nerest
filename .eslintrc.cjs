/**
 * @type {import('eslint').ESLint.ConfigData}
 */
module.exports = {
  parserOptions: {
    project: ['./tsconfig.json', './tsconfig.eslint.json'],
  },
  extends: ['@tinkoff/eslint-config/lib', '@tinkoff/eslint-config-react'],
  ignorePatterns: ['/node_modules/', '/dist/'],

  rules: {
    // allow console.log by default: in nerest binary and client code
    'no-console': 'off',
    'no-param-reassign': 'off',
    '@typescript-eslint/naming-convention': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'always',
        ts: 'never',
      },
    ],
  },

  overrides: [
    // disallow console.log in server code, must use fastify app.log instead
    {
      files: ['server/**'],
      excludedFiles: ['server/loaders/**'],
      rules: {
        'no-console': 'error',
      },
    },
    {
      // typescript references start with three slashes
      files: ['*.d.ts'],
      rules: {
        'spaced-comment': 'off',
      },
    },
  ],
};
