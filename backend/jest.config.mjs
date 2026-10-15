export default {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.mjs'],
  // Testamos o JavaScript compilado pelo build do próprio projeto.
  transform: {},
  restoreMocks: true,
};
