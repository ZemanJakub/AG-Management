import { test, expect } from "@playwright/test";

test.describe("Přihlašovací stránka - chybové scénáře a modal", () => {
  test("Modal se zobrazí a po kliknutí na tlačítko 'Rozumím' se skryje", async ({ page }) => {
    await page.goto("http://localhost:3000/signin");

    // Ujistíme se, že v localStorage není uložen souhlas s cookies
    await page.evaluate(() => localStorage.removeItem("cookieConsent"));

    // Obnovíme stránku, aby se useEffect spustil znovu a modal se zobrazil
    await page.reload();

    // Přidáme styl pro vypnutí animací (pomůže modal okamžitě zobrazit)
    await page.addStyleTag({
      content: `* { transition: none !important; animation: none !important; }`,
    });

    // Vyčkejte, až se modal objeví – hledáme nadpis v ModalHeader s textem "Informace o cookies"
    const modalHeader = await page.waitForSelector("h3:has-text('Informace o cookies')", { timeout: 10000 });
    expect(await modalHeader.textContent()).toContain("Informace o cookies");

    // Najděte tlačítko "Rozumím" a ověřte, že je viditelné
    const acceptButton = page.locator("button >> text=Rozumím");
    await expect(acceptButton).toBeVisible();

    // Klikněte na tlačítko "Rozumím"
    await acceptButton.click({ force: true });

    // Počkejte krátce, aby se modal zavřel
    await page.waitForTimeout(1000);

    // Ověřte, že nadpis modalu již není viditelný
    const headerAfterClick = page.locator("h3:has-text('Informace o cookies')");
    await expect(headerAfterClick).toBeHidden();
  });
});




// import { test, expect } from "@playwright/test";

// test.describe("Přihlášení a přesměrování na dashboard", () => {
//   test("Přihlášení na dashboard", async ({ page }) => {
//     console.log("🔐 Otevírám přihlašovací stránku...");
//     await page.goto("http://localhost:3000/signin");

//     // Ověření, že jsme na přihlašovací stránce
//     await expect(page).toHaveURL(/signin/);
//     console.log("✅ Jsme na přihlašovací stránce.");


//     const modal = page.locator("[data-testid='cookie-consent-modal']");
// if (await modal.isVisible()) {
//   console.log("🛑 Zavírám modal...");
//   await modal.locator("button >> text=Rozumím").click();
//   await page.waitForTimeout(500);
// }

//     // Vyplnění přihlašovacího formuláře
//     console.log("📝 Vyplňuji přihlašovací údaje...");
//     await page.fill('input[name="email"]', "test@gmail.com");
//     await page.fill('input[name="password"]', "Test1");

//     const submitButton = page.locator('[data-testid="login-button"]');

//     // Ověření, že tlačítko je kliknutelné
//     await expect(submitButton).toBeVisible();
//     await expect(submitButton).toBeEnabled();
//     await expect(submitButton).toBeInViewport();

//     // Screenshot před kliknutím
//     await page.screenshot({ path: "debug-before-click.png", fullPage: true });

//     // Kliknutí na tlačítko přihlášení
//     console.log("🚀 Klikám na tlačítko přihlášení...");
//     await submitButton.click({ force: true });

//     // Počkej na stabilní síťové připojení
//     // await page.waitForLoadState("networkidle");
//     await page.waitForTimeout(5000); // čeká 5 sekund

//     // Ověření, že nejsme stále na signin
//     const currentUrl = page.url();
//     console.log("📢 Aktuální URL po přihlášení:", currentUrl);

//     if (currentUrl.includes("signin")) {
//       console.error("❌ Uživatel stále na přihlašovací stránce!");
//       await page.screenshot({ path: "debug-still-on-signin.png", fullPage: true });
//       throw new Error("Uživatel se nepřihlásil!");
//     }

//     // Ověření přesměrování na dashboard
//     await page.waitForURL("http://localhost:3000/dashboard", { timeout: 20000 });
//     await expect(page).toHaveURL("http://localhost:3000/dashboard");

//     // Screenshot po přihlášení
//     await page.screenshot({ path: "debug-dashboard.png", fullPage: true });
//   });
// });
