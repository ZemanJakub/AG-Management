
import { chromium, expect } from "@playwright/test";
import fs from "fs";

async function globalSetup() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("🔐 Přihlašování...");
  await page.goto("http://localhost:3000/signin");

  // Zavření cookie modalu pomocí ID tlačítka
  const modalButton = page.locator("#initconset");

  if (await modalButton.isVisible()) {
    console.log("🛑 Zavírám modal...");
    await modalButton.click();
    await page.waitForTimeout(500);
  }

  // Vyplnění formuláře
  console.log("📝 Vyplňuji přihlašovací údaje...");
  await page.fill('input[name="email"]', "test@gmail.com");
  await page.fill('input[name="password"]', "Test1");

  const submitButton = page.locator('[data-testid="login-button"]');

  await expect(submitButton).toBeVisible();
  await submitButton.click();

  // Počkej na přesměrování na dashboard
  await page.waitForURL("http://localhost:3000/dashboard", { timeout: 20000 });

  // Ulož session
  console.log("💾 Ukládám session...");
  const storage = await context.storageState();
  fs.writeFileSync("auth.json", JSON.stringify(storage));

  await browser.close();
}

export default globalSetup;
