module.exports = {
    root: true,
    extends: ['@lsagetlethias'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: ['./tsconfig.json', './tsconfig.eslint.json'],
        sourceType: 'module',
    },
    rules: {
        'no-unused-vars': 'off',
    },
};
