/** @type {import('stylelint').Config} */
export default {
  ignoreFiles: ['dist/**/*.css'],
  extends: ['stylelint-config-standard'],
  rules: {
    'alpha-value-notation': 'number',
    'block-no-empty': null,
    'color-function-notation': 'legacy',
  },
};
