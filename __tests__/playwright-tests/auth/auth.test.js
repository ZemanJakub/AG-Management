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



// import { test, expect } from "@playwright/test";

// test.describe("Přihlašovací stránka - chybové scénáře a modal", () => {
//   test("Modal se zobrazí a po kliknutí na tlačítko 'Rozumím' se skryje, validace e-mailu funguje a při odeslání neplatných údajů se zobrazí chybová zpráva", async ({
//     page,
//   }) => {
//     // Načteme přihlašovací stránku
//     await page.goto("http://localhost:3000/signin");

//     // Odstraníme souhlas s cookies z localStorage, aby se modal spustil
//     await page.evaluate(() => localStorage.removeItem("cookieConsent"));

//     // Obnovíme stránku, aby se useEffect spustil znovu a modal se zobrazil
//     await page.reload();

//     // Přidáme styly pro vypnutí animací (usnadníme testování)
//     await page.addStyleTag({
//       content: `* { transition: none !important; animation: none !important; }`,
//     });

//     // Vyčkáváme, dokud se modal neobjeví – hledáme nadpis s textem "Informace o cookies"
//     const modalHeader = await page.waitForSelector(
//       "h3:has-text('Informace o cookies')",
//       { timeout: 10000 }
//     );
//     expect(await modalHeader.textContent()).toContain("Informace o cookies");

//     // Ověříme, že tlačítko "Rozumím" je viditelné a poté na něj klikneme
//     const acceptButton = page.locator("button >> text=Rozumím");
//     await expect(acceptButton).toBeVisible({ timeout: 5000 });
//     await acceptButton.click({ force: true });

//     // Počkejte krátce, aby se modal zavřel
//     await page.waitForTimeout(1000);

//     // Ověříme, že modal již není viditelný
//     const headerAfterClick = page.locator("h3:has-text('Informace o cookies')");
//     await expect(headerAfterClick).toBeHidden({ timeout: 5000 });

//     // --- Test validace e-mailu ---
//     // Vyplníme neplatný e-mail a simulujeme blur
//     const emailInput = page.locator('input[name="email"]');
//     await emailInput.fill("invalid-email");
//     await page.locator("body").click();
//     // Ověříme, že se objeví chybová zpráva validace e-mailu
//     const emailErrorMsg = page.locator("text=Zadejte platný email");
//     await expect(emailErrorMsg).toBeVisible({ timeout: 5000 });
//     // Pořiďte screenshot s chybovou zprávou pro e-mail
//     await page.screenshot({ path: "error-email.png", fullPage: true });

//     // --- Test odeslání neplatných údajů ---
//     // Vyčistíme e-mail, vyplníme platný formát a zadáme neplatné heslo
//     await emailInput.fill("test@gmail.com");
//     const passwordInput = page.locator('input[name="password"]');
//     await passwordInput.fill("wrongpassword");
//     // Klikneme na tlačítko Login
//     const loginButton = page.locator('[data-testid="login-button"]');
//     await expect(loginButton).toBeVisible({ timeout: 5000 });
//     await loginButton.click();
//     // Počkejme, dokud se neobjeví chybová zpráva pro neplatné přihlášení
//     const loginErrorMsg = page
//       .locator("text=Zadaný email, nebo heslo nejsou platné")
//       .first();
//     await expect(loginErrorMsg).toBeVisible({ timeout: 10000 });

//     // Pořiďte screenshot s chybovou zprávou pro neplatné přihlášení
//     await page.screenshot({ path: "error-login.png", fullPage: true });
//   });
// });

// import { test, expect } from "@playwright/test";

// test.describe("Přihlašovací stránka - chybové scénáře a modal", () => {
//   test("Modal se zobrazí a po kliknutí na tlačítko 'Rozumím' se skryje a validace emailu funguje", async ({ page }) => {
//     // Načteme přihlašovací stránku
//     await page.goto("http://localhost:3000/signin");

//     // Odstraníme souhlas s cookies z localStorage, aby se modal spustil
//     await page.evaluate(() => localStorage.removeItem("cookieConsent"));

//     // Obnovíme stránku, aby se useEffect spustil znovu a modal se zobrazil
//     await page.reload();

//     // Přidáme styly pro vypnutí animací (usnadníme testování)
//     await page.addStyleTag({
//       content: `* { transition: none !important; animation: none !important; }`,
//     });

//     // Vyčkáváme, dokud se modal neobjeví – hledáme nadpis s textem "Informace o cookies"
//     const modalHeader = await page.waitForSelector("h3:has-text('Informace o cookies')", { timeout: 10000 });
//     expect(await modalHeader.textContent()).toContain("Informace o cookies");

//     // Ověříme, že tlačítko "Rozumím" je viditelné a poté na něj klikneme
//     const acceptButton = page.locator("button >> text=Rozumím");
//     await expect(acceptButton).toBeVisible();
//     await acceptButton.click({ force: true });

//     // Počkejte krátce, aby se modal zavřel
//     await page.waitForTimeout(1000);

//     // Ověříme, že modal již není viditelný
//     const headerAfterClick = page.locator("h3:has-text('Informace o cookies')");
//     await expect(headerAfterClick).toBeHidden();

//     // Test validace e-mailu: vyplníme neplatný e-mail a simulujeme "blur"
//     const emailInput = page.locator('input[name="email"]');
//     await emailInput.fill("invalid-email");
//     await page.locator("body").click();

//     // Ověříme, že se objeví chybová zpráva
//     const errorMsg = page.locator("text=Zadejte platný email");
//     await expect(errorMsg).toBeVisible();

//     // Pořiďte screenshot, kdy je chybová zpráva viditelná
//     await page.screenshot({ path: "error-email.png", fullPage: true });
//   });
// });
