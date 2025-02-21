import { test, expect } from "@playwright/test";

test.describe("Přihlašovací stránka - chybové scénáře a modal", () => {
  test("Modal se zobrazí a po kliknutí na tlačítko 'Rozumím' se skryje a validace emailu funguje", async ({ page }) => {
    // Načteme přihlašovací stránku
    await page.goto("http://localhost:3000/signin");

    // Odstraníme souhlas s cookies z localStorage, aby se modal spustil
    await page.evaluate(() => localStorage.removeItem("cookieConsent"));

    // Obnovíme stránku, aby se useEffect spustil znovu a modal se zobrazil
    await page.reload();

    // Přidáme styly pro vypnutí animací (usnadníme testování)
    await page.addStyleTag({
      content: `* { transition: none !important; animation: none !important; }`,
    });

    // Vyčkáváme, dokud se modal neobjeví – hledáme nadpis s textem "Informace o cookies"
    const modalHeader = await page.waitForSelector("h3:has-text('Informace o cookies')", { timeout: 10000 });
    expect(await modalHeader.textContent()).toContain("Informace o cookies");

    // Ověříme, že tlačítko "Rozumím" je viditelné a poté na něj klikneme
    const acceptButton = page.locator("button >> text=Rozumím");
    await expect(acceptButton).toBeVisible();
    await acceptButton.click({ force: true });

    // Počkejte krátce, aby se modal zavřel
    await page.waitForTimeout(1000);

    // Ověříme, že modal již není viditelný
    const headerAfterClick = page.locator("h3:has-text('Informace o cookies')");
    await expect(headerAfterClick).toBeHidden();

    // Test validace e-mailu: vyplníme neplatný e-mail a simulujeme "blur"
    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill("invalid-email");
    await page.locator("body").click();

    // Ověříme, že se objeví chybová zpráva
    const errorMsg = page.locator("text=Zadejte platný email");
    await expect(errorMsg).toBeVisible();

    // Pořiďte screenshot, kdy je chybová zpráva viditelná
    await page.screenshot({ path: "error-email.png", fullPage: true });
  });
});
