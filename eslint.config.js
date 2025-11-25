import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginTypeScript from '@typescript-eslint/eslint-plugin';
import eslintParserTypeScript from '@typescript-eslint/parser';

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

export default config;
