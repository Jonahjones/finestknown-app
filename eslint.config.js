// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    files: ['src/**/*.{ts,tsx,js,jsx}'],
    rules: {
      // Prevent raw hex color codes - use theme tokens instead
      'no-restricted-syntax': [
        'error',
        {
          selector: "Literal[value=/#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}/]",
          message: 'Raw hex colors are not allowed. Use colors from src/theme.ts instead. Exceptions: #000 for shadows.',
        },
      ],
    },
  },
]);
