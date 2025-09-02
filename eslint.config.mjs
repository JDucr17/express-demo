import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  prettier,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/require-await': 'error',
    
      'no-eval': 'error',
      'no-implied-eval': 'error',
      
      'no-unreachable': 'error',
      'no-await-in-loop': 'warn',
    },
  },
  {
    ignores: ['node_modules/', 'dist/', '**/*.js', '**/*.mjs'],
  }
);