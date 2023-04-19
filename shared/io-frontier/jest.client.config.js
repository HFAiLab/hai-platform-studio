/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  collectCoverageFrom: ['src/client/*.ts'],
  roots: ['<rootDir>/__tests__/client'],
  testURL: 'http://localhost/',
  testPathIgnorePatterns: ['<rootDir>/__tests__/explore', '<rootDir>/__tests__/client/setup.js'],
}
