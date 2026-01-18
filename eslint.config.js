const eslintPluginPrettier = require('eslint-plugin-prettier');
const eslintPluginReact = require('eslint-plugin-react');
const eslintPluginTypeScript = require('@typescript-eslint/eslint-plugin');
const eslintParserTypeScript = require('@typescript-eslint/parser');

const config = [
  {
    ignores: ['node_modules', 'dist', '.next', 'public'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parser: eslintParserTypeScript,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      prettier: eslintPluginPrettier,
      react: eslintPluginReact,
      '@typescript-eslint': eslintPluginTypeScript,
    },
    rules: {
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
        },
      ],
      'react/react-in-jsx-scope': 'off',
      'linebreak-style': 'off',
    },
  },
];

module.exports = config;
