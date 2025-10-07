/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.js', '**/?(*.)+(spec|test).js'],
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleFileExtensions: ['js', 'json'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/config/',
    '/migrations/',
    '/seeders/',
    '/z_comentarios/',
    '/chat/',
  ],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'middleware/**/*.js',
    'assets/**/*.js',
    'services/**/*.js',
    '!**/node_modules/**',
    '!**/*.config.js'
  ],
};
