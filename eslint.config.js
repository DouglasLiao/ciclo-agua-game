// Flat config ESLint
import js from '@eslint/js'
import importPlugin from 'eslint-plugin-import'
import jestPlugin from 'eslint-plugin-jest'
import prettierPlugin from 'eslint-plugin-prettier'

export default [
  {
    ignores: [
      'node_modules/**',
      'coverage/**',
      'raiz/assets/**',
      'assets/**',
      'dist/**',
      'build/**'
    ]
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        Phaser: 'readonly',
        window: 'readonly',
        document: 'readonly',
        URLSearchParams: 'readonly',
        fetch: 'readonly',
        process: 'readonly'
      }
    },
    plugins: {
      import: importPlugin,
      jest: jestPlugin,
      prettier: prettierPlugin
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': 'off',
      'import/no-unresolved': 'error',
      'jest/expect-expect': 'off',
      semi: ['error', 'never'],
      'no-extra-semi': 'error',
      'prettier/prettier': ['error']
    }
  },
  {
    files: ['raiz/tests/**/*.js'],
    plugins: { jest: jestPlugin },
    languageOptions: {
      globals: {
        describe: 'readonly',
        test: 'readonly',
        expect: 'readonly'
      }
    },
    rules: {
      // poderia adicionar regras específicas de teste aqui
    }
  }
]
