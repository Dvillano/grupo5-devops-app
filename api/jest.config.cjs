const { resolve } = require('path');

module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.js"],
  verbose: true,
  transform: {},
  setupFiles: [resolve('./setup-env.js')]
}
