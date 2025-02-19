import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 60000,
  globalSetup: "./playwright.setup.ts", // 🔥 Automatické přihlášení
  use: { 
    baseURL: "http://localhost:3000",
    headless: true,
    viewport: { width: 1280, height: 720 },
    storageState: "auth.json", // 🔥 Použití session souboru
  },
  webServer: {
    command: "npm run dev",
    port: 3000,
    reuseExistingServer: true,
  },
});