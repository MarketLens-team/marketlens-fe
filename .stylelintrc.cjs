/** @type {import('stylelint').Config} */
module.exports = {
  ignoreFiles: [
    'dist/**',
    '**/node_modules/**',
    /* Dev layout experiments — non-global colors allowed by project rules */
    'src/pages/Dev*.module.css',
    'src/components/**/Dev*.module.css',
  ],
  rules: {
    /* Design token enforcement: no raw colors outside tokens.css */
    'color-no-hex': true,
    'function-disallowed-list': ['rgb', 'rgba'],
  },
  overrides: [
    {
      files: ['src/styles/tokens.css'],
      rules: {
        'color-no-hex': null,
        'function-disallowed-list': null,
      },
    },
  ],
};
