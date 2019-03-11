module.exports = {
  testEnvironment: "node",

  collectCoverageFrom: [
    "lib/**/*.js",
    "!**/tests/**",
    "!**/node_modules/**",
    "!**/_mocks_/**",
    "!**/__mocks__/**"
  ],

  coverageReporters: ["text-summary", "json", "html"],
  collectCoverage: true,
  coverageDirectory: "coverage/"
};
