module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    __DEV__: true,
    jest: true,
    describe: true,
    it: true,
    expect: true,
    beforeEach: true,
    afterEach: true,
  },
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  testPathIgnorePatterns: ['<rootDir>/lib/', '<rootDir>/nitrogen/generated/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
