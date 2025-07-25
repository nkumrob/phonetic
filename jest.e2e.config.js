const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  displayName: 'e2e',
  testMatch: ['**/__tests__/**/*.e2e.test.[jt]s?(x)'],
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/app/(.*)$': '<rootDir>/app/$1',
    '^@/tests/(.*)$': '<rootDir>/__tests__/$1',
  },
  testTimeout: 30000, // E2E tests may take longer
  maxWorkers: 1, // Run E2E tests serially
}

module.exports = createJestConfig(customJestConfig)