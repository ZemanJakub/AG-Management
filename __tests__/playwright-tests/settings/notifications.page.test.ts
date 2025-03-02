import { test, expect } from "@playwright/test";

test.describe("Notifications Settings Page", () => {
  test.beforeEach(async ({ page }) => {
    // Díky storageState je uživatel přihlášen (nastaveno v playwright.config.ts)
    await page.goto("/settings/notifications");
  });

  test("should display header, SettingsSidebar and meta description", async ({
    page,
  }) => {
    // Ověříme, že hlavní stránka má nadpis "Nastavení"
    await expect(page.locator("h1")).toHaveText("Nastavení");

    // Ověříme, že se zobrazuje SettingsSidebar
    // Budeme hledat <div> element, který obaluje sidebar a má text "Obecná nastavení"
    await expect(
      page.locator(
        "div.text-xs.font-semibold.text-gray-400.dark\\:text-gray-500.uppercase.mb-3",
        { hasText: "Obecná nastavení" }
      )
    ).toBeVisible();
    // Ověříme, že se zobrazuje #sidebar element
    await expect(page.locator("#sidebar")).toBeVisible();

    // Ověříme, že stránka má správný meta description
    const metaDescription = await page
      .locator('meta[name="description"]')
      .getAttribute("content");
    expect(metaDescription).toBe("Set your notifications preferences.");
  });

  test("should display elements in NotificationsPanel correctly", async ({
    page,
  }) => {
    // Ověříme, že se zobrazuje nadpis "Oznámení"
    await expect(page.locator("h2", { hasText: "Oznámení" })).toBeVisible();

    // Ověříme, že se zobrazují sekce "Push notifikace" a "Notifikace v aplikaci"
    await expect(page.locator("h3", { hasText: "Push notifikace" })).toBeVisible();
    await expect(page.locator("h3", { hasText: "Notifikace v aplikaci" })).toBeVisible();

    // Ověříme, že se zobrazují všechny prvky v sekci "Push notifikace"
    const pushNotificationsSection = page.locator('h3:has-text("Push notifikace")').locator("..");
    await expect(pushNotificationsSection.locator('div.text-gray-800.dark\\:text-gray-100.font-semibold', {hasText: 'Push notifikace'})).toBeVisible();
    await expect(pushNotificationsSection.locator('div.text-sm', {hasText: 'Umožňují uživateli zasílat zprávy pomocí systémového rozhraní i v případě, že aplikaci aktuálně nevyužívá. Nastavení je platné pouze pro aktuální zařízení.'})).toBeVisible();
    const testSendingSection = page.locator('h3:has-text("Push notifikace")').locator("..");
    await expect(testSendingSection.locator('div.text-gray-800.dark\\:text-gray-100.font-semibold', {hasText: 'Test odesílání'})).toBeVisible();
    await expect(testSendingSection.locator('div.text-sm', {hasText: 'Domníváte se, že odesílání zpráv nefunguje správně? Odešlete testovací zprávu.'})).toBeVisible();
    await expect(testSendingSection.locator('button', { hasText: 'Odeslat' })).toBeVisible();

    // Ověříme, že se zobrazují všechny prvky v sekci "Notifikace v aplikaci"
    const applicationNotificationsSection = page.locator('h3:has-text("Notifikace v aplikaci")').locator("..");
    await expect(applicationNotificationsSection.locator('div.text-gray-800.dark\\:text-gray-100.font-semibold', {hasText: 'Vymazat notifikace'})).toBeVisible();
    await expect(applicationNotificationsSection.locator('div.text-sm', {hasText: 'Pokud se Vám nahromadilo větší množství notifikací a chcete je jednorázově vymazat, použijte tuto volbu. Upozorňujeme, že volba je nevratná.'})).toBeVisible();
    await expect(applicationNotificationsSection.locator('button', { hasText: 'Smazat' })).toBeVisible();

    // Ověříme, že se zobrazuje tlačítko "Uložit změny"
    await expect(page.locator("button", { hasText: "Uložit změny" })).toBeVisible();
  });
});

