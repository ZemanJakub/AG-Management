import { test, expect } from "@playwright/test";

test.describe("Přihlašovací stránka - chybové scénáře, modal a responzivita", () => {
  test("Modal se zobrazí a po kliknutí na tlačítko 'Rozumím' se skryje, validace e-mailu funguje, při odeslání neplatných údajů se zobrazí chybová zpráva a AuthHeader je správně responzivní", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/signin");

    // -- MODAL TEST --
    await page.evaluate(() => localStorage.removeItem("cookieConsent"));
    await page.reload();
    await page.addStyleTag({
      content: `* { transition: none !important; animation: none !important; }`,
    });

    const modalHeader = await page.waitForSelector(
      "h3:has-text('Informace o cookies')",
      { timeout: 10000 }
    );
    expect(await modalHeader.textContent()).toContain("Informace o cookies");

    const acceptButton = page.locator("button >> text=Rozumím");
    await expect(acceptButton).toBeVisible({ timeout: 5000 });
    await acceptButton.click({ force: true });

    await page.waitForTimeout(1000);
    await expect(page.locator("h3:has-text('Informace o cookies')")).toBeHidden(
      { timeout: 5000 }
    );

    // -- EMAIL VALIDACE TEST --
    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill("invalid-email");
    await page.locator("body").click();
    await expect(page.locator("text=Zadejte platný email")).toBeVisible({
      timeout: 5000,
    });
    await page.screenshot({ path: "error-email.png", fullPage: true });

    // -- NEPLATNÉ PŘIHLÁŠENÍ TEST --
    await emailInput.fill("test@gmail.com");
    const passwordInput = page.locator('input[name="password"]');
    await passwordInput.fill("wrongpassword");
    const loginButton = page.locator('[data-testid="login-button"]');
    await expect(loginButton).toBeVisible({ timeout: 5000 });
    await loginButton.click();
    const loginErrorMsg = page
      .locator("text=Zadaný email, nebo heslo nejsou platné")
      .first();
    await expect(loginErrorMsg).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: "error-login.png", fullPage: true });

    // -- RESPONSIVNÍ TEST AuthHeader --
    await page.setViewportSize({ width: 500, height: 800 }); // Simulujeme mobilní velikost
    const authHeader = page.locator("img[alt='Logo']").first();
    await expect(authHeader).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Přihlašovací stránka - úspěšné přihlášení", () => {
  test("Úspěšné přihlášení přesměruje uživatele na dashboard", async ({
    page,
  }) => {
    // Přejít na přihlašovací stránku
    await page.goto("http://localhost:3000/signin");

    // Odstraníme cookie modal pokud existuje
    await page.evaluate(() => {
      if (!localStorage.getItem("cookieConsent")) {
        localStorage.setItem("cookieConsent", "true");
      }
    });
    await page.reload();

    // Vyplnění přihlašovacích údajů
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    const loginButton = page.locator('[data-testid="login-button"]');

    // Vyplnění platných údajů - použijte skutečné testovací údaje z vašeho systému
    await emailInput.fill("test@gmail.com"); // Upravte na platné údaje
    await passwordInput.fill("Test1"); // Upravte na platné údaje

    // Kliknutí na tlačítko pro přihlášení
    await loginButton.click();

    // Čekání na jakékoliv přesměrování (místo konkrétní URL)
    await page.waitForNavigation({ timeout: 15000 });

    // Vypíšeme aktuální URL pro diagnostiku
    console.log("Aktuální URL po přihlášení:", page.url());

    // Ověříme, že nejsme na stránce signin (což by naznačovalo neúspěšné přihlášení)
    await expect(page).not.toHaveURL(/.*\/signin.*/);

    // Například přítomnost nějakého prvku v navigaci nebo sidebar, který je viditelný pouze po přihlášení
    const header = page.locator("header.sticky"); // ✅ Přesnější selektor
    await expect(header).toBeVisible();

    // Pořízení screenshotu po přihlášení
    await page.screenshot({ path: "after-login.png", fullPage: true });
  });
});

test.describe("Přihlašovací stránka - zachování přihlášení", () => {
  test("Uživatel zůstává přihlášen po obnovení stránky", async ({ page }) => {
    // Přejít na přihlašovací stránku
    await page.goto("http://localhost:3000/signin");

    // Odstraníme cookie modal pokud existuje
    await page.evaluate(() => {
      if (!localStorage.getItem("cookieConsent")) {
        localStorage.setItem("cookieConsent", "true");
      }
    });
    await page.reload();

    // Vyplnění přihlašovacích údajů
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    const loginButton = page.locator('[data-testid="login-button"]');

    // Vyplnění platných údajů - použijte skutečné testovací údaje z vašeho systému
    await emailInput.fill("test@gmail.com"); // Upravte na platné údaje
    await passwordInput.fill("Test1"); // Upravte na platné údaje

    // Kliknutí na tlačítko pro přihlášení
    await loginButton.click();

    // Čekání na přesměrování na chráněnou stránku
    await page.goto("/dashboard");
    // Uložíme URL po přihlášení
    const authenticatedUrl = page.url();
    console.log("URL po přihlášení:", authenticatedUrl);

    // Ověříme, že nejsme na stránce signin (což by naznačovalo neúspěšné přihlášení)
    await expect(page).not.toHaveURL(/.*\/signin.*/);

    // Ověření přítomnosti indikátoru přihlášení (například uživatelské menu)
    const header = page.locator("header.sticky"); // ✅ Přesnější selektor
    await expect(header).toBeVisible();

    // Pořídíme screenshot před obnovením stránky
    await page.screenshot({ path: "before-refresh.png", fullPage: true });

    // Obnovíme stránku
    await page.reload();

    // Počkáme na načtení stránky
    await page.waitForLoadState("networkidle");

    // Pořídíme screenshot po obnovení stránky
    await page.screenshot({ path: "after-refresh.png", fullPage: true });

    // Ověříme, že jsme stále na stejné URL
    expect(page.url()).toBe(authenticatedUrl);
  });
});
