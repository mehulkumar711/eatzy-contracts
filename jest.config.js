module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  roots: ['<rootDir>/apps/', '<rootDir>/libs/'],
  // This is the fix
  moduleNameMapper: {
    '^@app/shared(|/.*)$': '<rootDir>/libs/shared/src/$1',
    '^@app/contracts(|/.*)$': '<rootDir>/contracts/$1',
  },
};