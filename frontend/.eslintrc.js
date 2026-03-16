module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    // Désactiver temporairement pour la production
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react/no-unescaped-entities': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    '@next/next/no-img-element': 'warn',
    '@next/next/no-html-link-for-pages': 'warn',
    'react/jsx-key': 'warn',
    'prefer-const': 'warn',
    '@typescript-eslint/no-empty-object-type': 'warn',
    'react-hooks/rules-of-hooks': 'error', // Garder cette règle critique
  },
};
