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
    'color-named': 'never',
    'function-disallowed-list': ['rgb', 'rgba', 'hsl', 'hsla'],
    /* font-size must use rem scale tokens; spacing/radius px deferred (1–2px tweaks) */
    'declaration-property-unit-disallowed-list': {
      'font-size': ['px'],
    },
  },
  overrides: [
    {
      files: ['src/styles/tokens.css'],
      rules: {
        'color-no-hex': null,
        'color-named': null,
        'function-disallowed-list': null,
        'declaration-property-unit-disallowed-list': null,
      },
    },
  ],
};
