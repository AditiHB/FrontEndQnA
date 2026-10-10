import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['dist/', 'node_modules/'] },
  js.configs.recommended, // the standard set of "this is probably a bug" rules
  {
    languageOptions: {
      // Tell ESLint which built-in names exist, so it does not call `document` or `process` unknown.
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      eqeqeq: 'error', // always === (Step 3)
      'no-var': 'error', // let and const only (Step 2)
      'prefer-const': 'error', // use const if you never reassign (Step 2)
      // `({ stock, ...publicInfo }) => publicInfo` is a deliberate way to leave one thing out (Step 8).
      'no-unused-vars': ['error', { ignoreRestSiblings: true }],
    },
  },
];
