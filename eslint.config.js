import tinkoffLib from '@tinkoff/eslint-config/lib';

export default [
  {
    ignores: ['node_modules/**', 'dist/**'],
  },
  ...tinkoffLib,
  {
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
  },
  {
    // disallow console.log in server code, must use fastify app.log instead
    files: ['server/**'],
    rules: {
      'no-console': 'error',
    },
  },
  {
    // ...except in loaders, which run outside the request lifecycle
    files: ['server/loaders/**'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    // typescript references start with three slashes
    files: ['**/*.d.ts'],
    rules: {
      'spaced-comment': 'off',
    },
  },
];
