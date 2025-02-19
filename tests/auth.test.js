import { test, expect } from "@playwright/test";

test.describe("Přihlášení a přesměrování na dashboard", () => {
  test("Přihlášení na dashboard", async ({ page }) => {
    console.log("🔐 Otevírám přihlašovací stránku...");
    await page.goto("http://localhost:3000/signin");

    // Ověření, že jsme na přihlašovací stránce
    await expect(page).toHaveURL(/signin/);
    console.log("✅ Jsme na přihlašovací stránce.");


    const modal = page.locator("[data-testid='cookie-consent-modal']");
if (await modal.isVisible()) {
  console.log("🛑 Zavírám modal...");
  await modal.locator("button >> text=Rozumím").click();
  await page.waitForTimeout(500);
}

    // Vyplnění přihlašovacího formuláře
    console.log("📝 Vyplňuji přihlašovací údaje...");
    await page.fill('input[name="email"]', "test@gmail.com");
    await page.fill('input[name="password"]', "Test1");

    const submitButton = page.locator('[data-testid="login-button"]');

    // Ověření, že tlačítko je kliknutelné
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();
    await expect(submitButton).toBeInViewport();

    // Screenshot před kliknutím
    await page.screenshot({ path: "debug-before-click.png", fullPage: true });

    // Kliknutí na tlačítko přihlášení
    console.log("🚀 Klikám na tlačítko přihlášení...");
    await submitButton.click({ force: true });

    // Počkej na stabilní síťové připojení
    // await page.waitForLoadState("networkidle");
    await page.waitForTimeout(5000); // čeká 5 sekund

    // Ověření, že nejsme stále na signin
    const currentUrl = page.url();
    console.log("📢 Aktuální URL po přihlášení:", currentUrl);

    if (currentUrl.includes("signin")) {
      console.error("❌ Uživatel stále na přihlašovací stránce!");
      await page.screenshot({ path: "debug-still-on-signin.png", fullPage: true });
      throw new Error("Uživatel se nepřihlásil!");
    }

    // Ověření přesměrování na dashboard
    await page.waitForURL("http://localhost:3000/dashboard", { timeout: 20000 });
    await expect(page).toHaveURL("http://localhost:3000/dashboard");

    // Screenshot po přihlášení
    await page.screenshot({ path: "debug-dashboard.png", fullPage: true });
  });
});
