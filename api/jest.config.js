import { resolve } from 'path';

export default {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.js"],
  verbose: true,
  transform: {},
  setupFiles: [resolve('./setup-env.js')], 
