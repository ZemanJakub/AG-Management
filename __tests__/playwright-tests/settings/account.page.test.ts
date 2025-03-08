import { test, expect } from "@playwright/test";

test.describe("Account Settings Page", () => {
  test.beforeEach(async ({ page }) => {
    // Díky storageState je uživatel přihlášen (nastaveno v playwright.config.ts)
    await page.goto("/settings/account");
  });

  test("should display header, AccountPanel and sidebar", async ({ page }) => {
    // Ověříme, že hlavní stránka má nadpis "Nastavení"
    await expect(page.locator("h1")).toHaveText("Nastavení");
    // AccountPanel má nadpis "Můj účet"
    await expect(page.locator("h2", { hasText: "Můj účet" })).toBeVisible();
    // Zúžíme hledání odkazu "Můj účet" pouze na sekci "Obecná nastavení" v sidebaru
    const sidebarSection = page.locator("div", { hasText: "Obecná nastavení" });
    // Upravený locator pro "Můj účet"
    const accountLink = sidebarSection.getByRole("link", { name: "Můj účet" });
    await expect(accountLink).toBeVisible();
  });

  test("should pre-populate profile fields with user data", async ({
    page,
  }) => {
    // Ověříme, že vstupní pole obsahují předvyplněná data (jméno, příjmení, email)
    const firstName = await page
      .locator('input[name="first_name"]')
      .inputValue();
    expect(firstName).not.toBe("");
    const lastName = await page.locator('input[name="last_name"]').inputValue();
    expect(lastName).not.toBe("");
    const email = await page.locator('input[name="newemail"]').inputValue();
    expect(email).toContain("@");
  });

  test("should update profile information and redirect to signin", async ({
    page,
  }) => {
    // Změníme jméno a příjmení
    await page.fill('input[name="first_name"]', "Test");
    await page.fill('input[name="last_name"]', "User");
    // Vyplníme pole pro aktuální heslo, aby tlačítko "Uložit změny" bylo povoleno
    await page.fill('input[name="oldpassword"]', "Test1"); // Zde nutno doplnit skutečné heslo

    const submitButton = page.locator("button", { hasText: "Uložit změny" });
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // Po odeslání formuláře očekáváme, že stránka se přesměruje na /signin
    await page.waitForURL(/\/signin/); // 2 minuty
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/signin");
  });

  test('should update password validation indicators when new password is typed', async ({ page }) => {
      const newPasswordInput = page.locator('input[id="newpassword"]');
      const newPasswordCheckInput = page.locator('input[id="newpasswordcheck"]');

      // Zadáme neplatné heslo "abcde" – chybí velká písmena a číslice
      await newPasswordInput.fill('');
      await newPasswordInput.type('abcde');

      // Ověříme, že validace pro "Velká písmena" (v li) ukazuje červenou barvu
      const upperCaseItem = page.locator('li', { hasText: 'Velká písmena' });
      await expect(upperCaseItem).toHaveClass(/text-red-600/);

      // U "Malá písmena" je heslo "abcde" v pořádku – očekáváme zelenou barvu
      const lowerCaseItem = page.locator('li', { hasText: 'Malá písmena' });
      await expect(lowerCaseItem).toHaveClass(/text-green-600/);

      // U "Číslice" chybí číslice – očekáváme červenou barvu
      const digitItem = page.locator('li', { hasText: 'Číslice' });
      await expect(digitItem).toHaveClass(/text-red-600/);

      // Validace shody hesel: pokud kontrolní pole není vyplněno, očekáváme varování – červená
      const matchItem = page.locator('li', { hasText: /Zadaná hesla nejsou shodná/i });
      await expect(matchItem).toHaveClass(/text-red-600/);

      // Zadáme validní heslo "Abc1" do obou polí
      await newPasswordInput.fill('');
      await newPasswordInput.type('Abc1');
      await newPasswordCheckInput.fill('');
      await newPasswordCheckInput.type('Abc1');

      await expect(upperCaseItem).toHaveClass(/text-green-600/);
      await expect(lowerCaseItem).toHaveClass(/text-green-600/);
      await expect(digitItem).toHaveClass(/text-green-600/);
      const matchOkItem = page.locator('li', { hasText: /Zadaná hesla jsou shodná/i });
      await expect(matchOkItem).toHaveClass(/text-green-600/);
  });

  test('should navigate between settings pages using sidebar links', async ({ page }) => {
      // Zúžíme hledání odkazu "Notifikace" na sekci "Obecná nastavení" v sidebaru
      const sidebarSection = page.locator('div', { hasText: 'Obecná nastavení' });
      // Upravený locator pro "Notifikace"
      const notificationsLink = sidebarSection.getByRole('link', { name: 'Notifikace' });
      await expect(notificationsLink).toBeVisible();
      await notificationsLink.click();

      // Počkejme, až se URL změní na /settings/notifications
      await page.waitForURL('/settings/notifications');
      await expect(page.locator('h2')).toContainText(/Oznámení|Notifikace/);
  });

  test('should be responsive: account header and sidebar visible on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 500, height: 800 });
      // Hlavní nadpis stránky by měl být viditelný
      await expect(page.locator('h1')).toBeVisible();
      // Ověříme, že v sekci "Obecná nastavení" je odkaz "Můj účet" viditelný
      const sidebarSection = page.locator('div', { hasText: 'Obecná nastavení' });
      // Upravený locator pro "Můj účet" na mobilu
      const accountLink = sidebarSection.getByRole('link', { name: 'Můj účet' });
      await expect(accountLink).toBeVisible();
      await page.screenshot({ path: 'account-settings-mobile.png', fullPage: true });
  });
});
