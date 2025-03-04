import { test, expect } from "@playwright/test";

test.describe("Přihlašovací stránka - chybové scénáře, modal a responzivita", () => {
  test("Modal se zobrazí a po kliknutí na tlačítko 'Rozumím' se skryje, validace e-mailu funguje, při odeslání neplatných údajů se zobrazí chybová zpráva a AuthHeader je správně responzivní", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/signin");

    // -- MODAL TEST --
    await page.evaluate(() => localStorage.removeItem("cookieConsent"));
    await page.reload();
    await page.addStyleTag({ content: `* { transition: none !important; animation: none !important; }` });

    const modalHeader = await page.waitForSelector("h3:has-text('Informace o cookies')", { timeout: 10000 });
    expect(await modalHeader.textContent()).toContain("Informace o cookies");

    const acceptButton = page.locator("button >> text=Rozumím");
    await expect(acceptButton).toBeVisible({ timeout: 5000 });
    await acceptButton.click({ force: true });

    await page.waitForTimeout(1000);
    await expect(page.locator("h3:has-text('Informace o cookies')")).toBeHidden({ timeout: 5000 });

    // -- EMAIL VALIDACE TEST --
    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill("invalid-email");
    await page.locator("body").click();
    await expect(page.locator("text=Zadejte platný email")).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: "error-email.png", fullPage: true });

    // -- NEPLATNÉ PŘIHLÁŠENÍ TEST --
    await emailInput.fill("test@gmail.com");
    const passwordInput = page.locator('input[name="password"]');
    await passwordInput.fill("wrongpassword");
    const loginButton = page.locator('[data-testid="login-button"]');
    await expect(loginButton).toBeVisible({ timeout: 5000 });
    await loginButton.click();
    const loginErrorMsg = page.locator("text=Zadaný email, nebo heslo nejsou platné").first();
    await expect(loginErrorMsg).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: "error-login.png", fullPage: true });

    // -- RESPONSIVNÍ TEST AuthHeader --
    await page.setViewportSize({ width: 500, height: 800 }); // Simulujeme mobilní velikost
    const authHeader = page.locator("img[alt='Logo']").first();
    await expect(authHeader).toBeVisible({ timeout: 5000 });
  });
});