module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      files: ['*.config.js', '*.config.ts'],
      env: {
        node: true,
      },
    },
  ],
};
