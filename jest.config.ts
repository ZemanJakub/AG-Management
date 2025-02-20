import type { Config } from 'jest'
import nextJest from 'next/jest.js'
 
const createJestConfig = nextJest({
  dir: './',
})
const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  preset: "ts-jest",
  testPathIgnorePatterns: ["<rootDir>/__tests__/playwright-tests"],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'ts-jest', 
  },
  // Upravte transformIgnorePatterns, aby se transformovaly ESM moduly z "jose", "@heroui/modal" a "framer-motion"
  transformIgnorePatterns: [
    "/node_modules/(?!(jose|@heroui/modal|framer-motion)/)"
  ],
  verbose: true, 
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^jose$": "<rootDir>/__mocks__/jose.js"
  },
  setupFiles: ["<rootDir>/jest.polyfill.ts"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  roots: ["<rootDir>/__Tests__/jest-tests"],
}
 
export default createJestConfig(config)




// import type { Config } from 'jest'
// import nextJest from 'next/jest.js'
 
// const createJestConfig = nextJest({
//   dir: './',
// })
// const config: Config = {
//   coverageProvider: 'v8',
//   testEnvironment: 'jsdom',
//   preset: "ts-jest",
//   testPathIgnorePatterns: ["<rootDir>/__tests__/playwright-tests"],
//   transform: {
//     '^.+\\.(js|jsx|ts|tsx)$': 'ts-jest', 
//   },
//   transformIgnorePatterns: ['/node_modules/'], 

//   verbose: true, 
//   moduleNameMapper: {
//     "^@/(.*)$": "<rootDir>/$1",
//   },
//   setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
//   roots: ["<rootDir>/__Tests__/jest-tests"],
// }
 
// export default createJestConfig(config)

// import type { Config } from "jest";

// const config: Config = {
//   preset: "ts-jest",
//   testEnvironment: "jsdom",
//   testPathIgnorePatterns: ["<rootDir>/__tests__/playwright-tests"],
//   transform: {
//     '^.+\\.(js|jsx|ts|tsx)$': 'ts-jest', // Nebo '<rootDir>/node_modules/ts-jest'
//   },
//   transformIgnorePatterns: ['/node_modules/'], // Důležité: Ignorovat node_modules

//   verbose: true, // Zapne verbose režim
//   bail: 1,
//   moduleNameMapper: {
//     "^@/(.*)$": "<rootDir>/$1",
//   },
//   setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
//   roots: ["<rootDir>/__Tests__/jest-tests"],
//   // Přidána konfigurace pro generování reportu
// };

// export default config;