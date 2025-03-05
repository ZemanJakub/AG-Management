import type { Config } from 'jest'
import nextJest from 'next/jest.js'
 
const createJestConfig = nextJest({
  dir: './',
})

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  preset: "ts-jest",
  
  // Ignorovat Playwright testy
  testPathIgnorePatterns: ["<rootDir>/__tests__/playwright-tests"],
  
  // Transformer pro TypeScript
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'ts-jest', 
  },
  
  // Transformovat ESM moduly
  transformIgnorePatterns: [
    "/node_modules/(?!(jose|@heroui/modal|framer-motion)/)"
  ],
  
  verbose: true,
  
  // Opravené mapování modulů pro aliasy - bez 'src' prefixu
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^jose$": "<rootDir>/__mocks__/jose.js"
  },
  
  // Polyfills pro testovací prostředí
  setupFiles: ["<rootDir>/__Tests__/jest-tests/jest.polyfill.ts"],
  
  // Nový setup soubor
  setupFilesAfterEnv: [
    "<rootDir>/__Tests__/jest-tests/setup.ts"
  ],
  
  // Kořenový adresář pro testy
  roots: ["<rootDir>/__Tests__/jest-tests"],
  
  // Pokrytí kódu (coverage) - opravené cesty bez 'src' prefixu
  collectCoverageFrom: [
    "modules/auth/**/*.{js,jsx,ts,tsx}",
    "actions/auth/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**"
  ],
  
  // Časový limit pro testy
  testTimeout: 10000,
}
 
export default createJestConfig(config)